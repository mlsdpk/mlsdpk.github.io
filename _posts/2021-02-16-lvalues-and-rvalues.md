---
title:  "Lvalues and Rvalues"
date: 2021-02-16
# excerpt: "Understanding the concepts of lvalues and rvalues in C++ with examples."
# date: 2021-02-16
# last_modified_at: 2021-02-16
# permalink: /blog/2021/02/16/lvalues-and-rvalues/
categories: [Programming]
tags: [c++]
comments: false
---

In this blog post, we will try to understand the meaning behind the C++ concepts: **lvalues** and **rvalues**. We, C++ Developers, use to write a lot of C++ codes and are already familiar with and encounter these concepts mostly in compiler errors and warning messages. Since these are formal definitions, many of us do not immediately clear with their meanings. Now, let's try to understand these concepts informally. Having a good understanding of **lvalues** and **rvalues** in C++ is essential to deep dive into advanced features of C++11 like **rvalue references** and **move semantics**.
{: .text-justify}

Every [expression](https://en.cppreference.com/w/cpp/language/expressions) in C++ has a **type** and a **value category**. Prior to C++11, there were only two value categories: *lvalues* and *rvalues*. C++11 introduces three more value categories: **prvalue**, **xvalue**, and **glvalue**. In this post, we will fully ignore these value categories and only focus on **lvalue** and **rvalue**; however, if you want to learn more about these value categories, please refer to the original [cppreference](https://en.cppreference.com/w/cpp/language/value_category).
{: .text-justify}

You can simply think of **lvalue** as a value that appears on the left-hand side of an assignment and an rvalue on the right. Consider the following example:
{: .text-justify}

```c++
int x = 100;
```

Here a literal `100` is assigned to a `int` variable called `x`. In this case, by the simple definition from above, `100` is rvalue since it is located at the right side of the assignment and `x` is **lvalue** as assignment expects an **lvalue** as its left operand. However, this left and right definition is not entirely true.

> In general, **lvalue** can be thought of as an object (or an expression) which has an assigned memory location (or an address), where **rvalue** on the other hand, is a temporary object exists within the expression they were created. All non-lvalues can be simply thought of as **rvalues**.
{: .text-justify}

Objects such as literals (e.g., `100`), temporary values (e.g., `x + 5`), functions return by value (e.g., `some_func()`) are **rvalues**. In the example above, the value `100` is a literal so it is a **rvalue**. It is assigned to a variable `x` of type `int`, which has a specific memory address, so this definition makes `x` as a **lvalue**. Let's try to understand these concepts with more examples.
{: .text-justify}

```c++
int* y = &x;
```

In this example, the memory address of `x` is stored in the pointer variable `y`. The **address-of** operator `&` is used to get the memory address of `x`, which accepts an operand as **lvalue** and returns an **rvalue** memory address. This **rvalue** is stored in the **lvalue** pointer `y`.
{: .text-justify}

```c++
// assignment expects an **lvalue** as its left operand
100 = i; // error
(i + 5) = 100; // error
```

The expression in the above example gives error, as it is obvious, the assignment operator `=` only allows **lvalues** as its left operand. Also, since literal `100` and temporary value `(i + 5)` are **rvalues**, they do not have any specific memory address to behave as **lvalues**.
{: .text-justify}

```c++
int var = 0;

int func1() {
  return var;
}

int& func2() {
  return var;
}

int main() {
  func1() = 100; // error
  func2() = 100; // this works
  return 0;
}
```

Carefully look at the above code snippet. We define two functions called `func1()` and `func2()`. The first function returns the global variable `var` by **value** and the second one returns by **reference** to that global variable. Since functions return by value makes the output as **rvalues**, the expression `func1() = 100` gives error, as the left operand is **rvalue**. The second line works because the output of the `func2()` is **lvalue**, which references to the memory location of the global variable `var`.
{: .text-justify}

Prior to C++11, there was only one type of reference called **reference**, but now it can be called as **lvalue reference**.
{: .text-justify}

```c++
int x = 1;
int& y = x;
y++; // x becomes 2
```

Here, `y` is a **lvalue reference**, which binds to a **lvalue** `x`.
{: .text-justify}

```c++
int& y = 100; // error
```

This example doesn't work because **lvalue reference** needs lvalue to be bound but literal `100` is a rvalue and doesn't have a specific memory address as it's a temporary object.
{: .text-justify}

> More specifically, **lvalue references** can only be initialized with **modifiable lvalues**.
{: .text-justify}

```c++
const int x = 100;
int& y = x; // error
```

By adding a `const` keyword, the **lvalue** `x` in above example becomes a **non-modifiable lvalue**. Then, by the definition, we cannot assign **non-modifiable lvalue** `x` into **lvalue reference** `y`.
{: .text-justify}

> However, **lvalue references to const** objects can be initialized with both **modifiable lvalues** and **non-modifiable lvalues** as well as **rvalues**.
{: .text-justify}

The above definition makes **lvalue references to const** objects very useful. Consider the following example:
{: .text-justify}

```c++
int x = 100; // modifiable lvalue x
const int y = 100; // non-modifiable lvalue y

const int& i = x; // ok (modifiable lvalue)
const int& j = y; // ok (non-modifiable lvalue)
const int& k = 100; // ok (rvalue)
```

We can easily understand the concepts by following the comments of the above code snippet. The only limitation with the **lvalue references to const** objects is that if we want to manipulate a reference, we cannot. Let's look at some examples below using functions to understand more about these topics.
{: .text-justify}

```c++
void func(int& i, int& j) {
  // do something
}

int main() {
  func(100, 100); // error

  int i = 100;
  int j = 100;
  func(i, j); // ok

  return 0;
}
```

We can clearly see that we cannot pass **rvalues** directly to the function since `func()` accepts **lvalue references** as parameters. In C++, passing by reference is a more recommended way to do since it improves the performance of the code and reduces the unnecessary copies of the data between the memory locations of the objects. So, we can avoid passing **rvalues** directly by declaring **lvalues** first and passing them into functions, which is not very convenient. One way to make it works with **rvalues** is by making the function parameters as **lvalue references to const**.
{: .text-justify}

```c++
void func(const int& i, const int& j) {
  // do something
}

int main() {
  func(100, 100); // now ok

  int i = 100;
  int j = 100;
  func(i, j); // ok too
  return 0;
}
```

## Conclusion

What if we want to modify the reference value or we still need to improve the performance of our application using references, it will be a problem for us until C++11 was introduced. These several issues are addressed by introducing new features such as **rvalue references** and **move semantics** in C++11, which makes our lives easier. We will closely look at and discuss more about these topics in the future blog posts.
{: .text-justify}

## References

* ["https://en.cppreference.com/w/cpp/language/value_category"](https://en.cppreference.com/w/cpp/language/value_category) ---<cite>cppreference</cite>
* ["https://www.learncpp.com/cpp-tutorial/rvalue-references/"](https://www.learncpp.com/cpp-tutorial/rvalue-references/) ---<cite>learncpp</cite>
* ["https://www.internalpointers.com/post/understanding-meaning-lvalues-and-rvalues-c"](https://www.internalpointers.com/post/understanding-meaning-lvalues-and-rvalues-c) ---<cite>internalpointers</cite>
* ["https://drewcampbell92.medium.com/understanding-move-semantics-and-perfect-forwarding-987cf4dc7e27"](https://drewcampbell92.medium.com/understanding-move-semantics-and-perfect-forwarding-987cf4dc7e27) ---<cite>medium</cite>
