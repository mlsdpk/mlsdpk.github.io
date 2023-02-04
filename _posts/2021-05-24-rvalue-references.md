---
title:  "Rvalue References"
date: 2021-05-24
categories: [Programming]
tags: [c++]
comments: false
---

In my last blog post ["Lvalues and Rvalues in C++"](https://mlsdpk.github.io/blog/2021/02/16/lvalues-and-rvalues/), we discussed about the concepts behind the lvalues and rvalues in C++. If you haven't read the previous one yet, I strongly recommend you to read it before diving into new concepts, rvalue references and move semantics in this article. OK, now I assume you already know about the concepts behind lvalues, rvalues, and lvalue references. Let's dive into new concept of modern C++, the rvalue references.
{: .text-justify}

Let's do a quick refresher of previous concepts. We know that rvalues are the temporary objects, which only live within the expression they were created. Consider the following lines of code:
{: .text-justify}

```c++
int x = 100; // ok
int& y = x; // ok
int& z = 100; // error
const int& w = 100; // ok now
```

In the first line, the literal `100`, a temporary object (*rvalue*), is assigned to an integer variable `x` (*lvalue*). The second line indicates *lvalue reference*, `y`, initialized with a *lvalue*, `x`. The third line will give you error since *lvalue references* can only be initialized with modifiable lvalues. In order to fix this issue, we need to use lvalue references to const objects, as shown in fourth line. These *lvalue references to const objects* are very useful, particularly in passing arguments into functions. They allow us to pass any type of *lvalue* and *rvalue* without making a copy of an object. However, we cannot modify the values of those objects. We are only interested in modifying the rvalues otherwise, we'll ofcourse, remove the `const` keyword for lvalues. Unfortunately, we cannot remove `const` keyword for rvalues since it is the only way to pass into function without making a copy of it. So how? Thanks to C++11, a new type of reference is introduced, **rvalue reference**. It adds one more ampersand into lvalue reference syntax, containing two ampersands `&&`:
{: .text-justify}

```c++
// initialization of rvalue reference x
int&& x = 100;
```

One more thing to remember is that we cannot initialize rvalue references with modifiable or non-modifiable lvalues. The following example illustrates this.
{: .text-justify}

```c++
int x = 100; // modifiable lvalue x
const int y = 100; // non-modifiable lvalue y

int&& rref = x; // error
int&& rref = y; // error
int&& rref = 100; // ok now
```

> Specifically, rvalue references are designed to be initialized with rvalues only.
{: .text-justify}

Since we assign rvalue `100` to rvalue referecne `rref` in the above example, we are basically extending the lifespan of the rvalue object. We even can modify the rvalue if it is initialized with non-const rvalue reference. The following example explains this rvalue reference concept.
{: .text-justify}

```c++
int&& rref1 = 100; // non-const rvalue reference
rref1 = 200; // can modify

const int&& rref2 = 100; // const rvalue reference
rref2 = 200; // error (cannot modify)
```

Now, let's recall lvalue and lvalue reference concepts from previous blog post. I mentioned that passing by referecne can improve the performance of our code by reducing unnecessary copies of the data between the memory locations of the objects. I also showed with an example that if we want to pass rvalues as function arguments, there is only one way to do this by making the function parameters as lvalue references to const. However, since we are using const lvalue references, we cannot modify the rvalue object. Thanks to C++11, we can now apply the rvalue reference concept to our function parameters in order to modify the passed rvalue object. Take a look at the following example.
{: .text-justify}

```c++
// function(1)
// function accepting lvalue referecnes to const
void func(const int& i, const int& j) {
  // do something
  // but cannot modify i and j
}

// function(2)
// overloaded function accepting rvalue reference
void func(int&& i, int&& j) {
  // can modify i and j
  i = 0;
  j = 0;
}

int main() {
  int i = 100;
  int j = 100;

  func(i, j); // this calls (1)
  func(100, 100); // this calls (2)

  return 0;
}
```

We created the two overloaded functions with different function parameters. Function(1) is only called when we pass lvalues into it. When we pass rvalues, function(2) is called since it has rvalue references as function parameters. We can even modify the rvalues if we want.
{: .text-justify}

## Conclusion
We just learned the concepts behind the rvalue references in this article. These rvalue references are specifically designed for dealing with rvalues (or temporary objects). We can only initialize rvalue references with rvalues only. Although you may not usually use and see these concepts a lot, rvalue references are very important in the context of move semantics, which is a powerful concept to improve the performance of our code. We will cover move semantics in the future articles.
{: .text-justify}

## References
* ["https://www.learncpp.com/cpp-tutorial/rvalue-references/"](https://www.learncpp.com/cpp-tutorial/rvalue-references/) ---<cite>learncpp</cite>
* ["https://www.internalpointers.com/post/c-rvalue-references-and-move-semantics-beginners"](https://www.internalpointers.com/post/c-rvalue-references-and-move-semantics-beginners) ---<cite>internalpointers</cite>
