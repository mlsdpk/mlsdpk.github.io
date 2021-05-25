---
layout: blog-single
classes: wide
title:  "Rvalue References and Move Semantics in C++"
excerpt:
date: 2021-05-24
last_modified_at: 2021-05-24
permalink: /blog/2021/05/24/rvalue-references-and-move-semantics/
tags:
  - c++
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
