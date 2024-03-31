---
title:  "Notes on Multivariate Gaussians"
date: 2024-03-31
categories: [Statistics]
tags: [c++, math]
comments: true
math: true
published: true
---
# Prerequisites

## Linearity of Expectation
> Linearity of expectation is the property that the expected value of the sum of random variables is equal to the sum of their individual expected values, regardless of whether they are independent.

For random variables $X$ and $Y$:

$$
E[X + Y] = E[X] + E[Y]
$$

In general, for any random variables $X_1, X_2, \dots, X_n$ and constants $c_1, c_2, \dots, c_n$:

$$
E\left[ \sum_{i=1}^{n} c_i X_i \right] = \sum_{i=1}^{n} (c_i \cdot E[X_i]).
$$

## Random Vectors

A random vector $\mathbf{X}$ is a list of $n$ random variables defined in an $n \times 1$ (column) vector form:

$$

\mathbf{X} = \left[ \begin{array}{c}
X_1 \\
X_2 \\
\vdots \\
X_n
\end{array} \right]

$$

The expectation (mean) of the random vector $\mathbf{X}$ is given by:

$$

E[\mathbf{X}] = \left[ \begin{array}{c}
E[X_1] \\
E[X_2] \\
\vdots \\
E[X_n]
\end{array} \right]

$$

The linearity properties of expectation can be applied to random vectors as well, for example:

$$
E[A\mathbf{X}] = A \cdot E[\mathbf{X}]\\
E[A\mathbf{X} + b] = A \cdot E[\mathbf{X}] + b
$$