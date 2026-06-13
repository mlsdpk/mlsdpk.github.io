---
title:  "Tangent Vectors Are Just Directional Derivatives"
date: 2026-06-13
categories: [Robotics]
tags: [geometry, math]
comments: true
math: true
published: true
standfirst: "…and once you see that, your robot's velocities and its Jacobian turn out to be the very same idea wearing different hats."
media_subpath: /assets/img/posts/tangent-vectors/
---

If you've written any robotics code, you've hit this before.
You have an orientation, you have a small correction you'd like to apply, and you reach for the obvious move "*add them*", and everything falls apart.
Nudging a rotation matrix by a little update matrix gives you something that is no longer a rotation.
Two rotations refuse to average sensibly.
And your estimation library quietly refuses to let you use $$+$$ at all.
GTSAM, for example, makes you use that strange little $$\boxplus$$ ("boxplus") operator, which it calls `retract`.

These are not separate problems.
They're the same one, and the fix is one of the quietly beautiful ideas in differential geometry: **a tangent vector is a directional derivative**.
Let me walk you through why, mostly with pictures, and then show you that the velocities and Jacobians you already use every day were secretly this idea the whole time.

Here's the problem, in one figure.

![Adding a vector works in flat space but flies off a curved surface](fig1-the-wall.svg)
_Figure 1. In flat space, $$x + v$$ is another valid point. On a curved space the same arrow shoots straight off the surface, and the point you'd land on simply doesn't exist. Addition was never the real operation. It only worked because the world happened to be flat._

## The thing you do without thinking

Start somewhere comfortable. In flat space, the **directional derivative** asks a simple question.
If I stand at a point $$x$$ and head off in direction $$v$$, how fast does some function $$f$$ change? You learned the answer years ago:

$$
\mathrm{D}_v f(x) = \lim_{t \to 0}\frac{f(x+tv)-f(x)}{t}
$$

Now notice the only two things that actually showed up in the equation, the point you started from and the velocity you left with.
The straight line $$x+tv$$ was just there to get you moving.
You walked along it for an instant and then took $$t \to 0$$, so everything past that first instant got thrown away.
You never needed the whole line, only *where you started* and *which way and how fast* you were going.

![The directional derivative is the slope of f along the path at t equals zero](fig2-the-slope.svg)
_Figure 2, the slope. Walk away from $$x$$ along $$v$$, watch $$f$$ rise, and measure the slope at the instant you leave. That slope is the directional derivative. It depends only on the start and the initial velocity, nothing else._

> That little observation is the whole trick.
> If only the start and the initial velocity matter, then flatness was never needed, and neither was the straight line.

## When you can't go in a straight line

On curved spaces (the surface of a sphere, the set of rotations $$\mathrm{SO}(3)$$, your robot's configuration space),
there is no straight line $$x + tv$$ to walk along.
Figure 1 showed, loosely, why the arrow leaves the surface entirely, but we just figured out that the line was only there to get you moving.
So let's just throw it away and keep what mattered.

Replace the line with a **curve**, any path $$\gamma(t)$$ that lives *on* the surface, starts where you are ($$\gamma(0)=x$$), and leaves with the velocity you want ($$\gamma'(0)=v$$). Then differentiate $$f$$ along it.

$$
\mathrm{D}_v f(x) = \frac{d}{dt}\,f\big(\gamma(t)\big)\Big|_{t=0}
$$

The function $$f \circ \gamma$$ is just an ordinary function of one variable $$t$$, a number that changes as you travel, so its derivative is plain calculus again (the same limit you took in flat space). Back there the curve was simply $$\gamma(t) = x + tv$$.
Here it can be any curve that stays on the surface.
We never needed the space to be flat. We only needed a curve that stays on it.

![A curve on a surface, its velocity vector, and f composed with the curve as a one-dimensional slope](fig3-the-surface.svg)
_Figure 3. Lay a curve $$\gamma$$ on the surface through $$x$$ with velocity $$v$$. Feeding it through $$f$$ collapses everything to a one-variable function whose slope at $$t=0$$ is the directional derivative. Curved world, same answer._

## It doesn't matter which curve

You might worry that the answer now depends on *which* curve you chose, and that
would be a disaster, because there are infinitely many curves leaving $$x$$ in the same direction.
But I have good news for you.
It doesn't depend on the curve at all. Any two curves passing through $$x$$ that leave with the same velocity
give the **same derivative for every function** $$f$$ (Chain rule, if you want to check it).

![Two different curves through x sharing the same velocity vector](fig4-two-curves.svg){: w="400" }
_Figure 4, the curve doesn't matter either. Two curves $$\gamma_{1}$$, $$\gamma_{2}$$ leave $$x$$ with the same velocity $$v$$ and take completely different routes, yet they agree on the derivative of every function. The curve carries no information the velocity didn't already have._

So the curve was only there to get you moving too. What's left, the thing that actually carries the information,
is the velocity vector itself, but now seen from a new angle. Don't picture it as a little arrow.
Picture it as an *operator* that takes any function and hands you back a number, the rate of change as you leave
$$x$$ in that direction.

> That operator *is* the tangent vector. A tangent vector and a directional
> derivative are not two things that are related. They are the same thing.

The whole collection of these velocity-operators at a single point $$x$$ forms a flat
vector space called the **tangent space**, written $$\mathcal{T}_x\mathcal{M}$$.
It's what "all the directions you could leave $$x$$," really means, made precise and attached to the point $$x$$,
and crucially, *it* is flat even when the space $$\mathcal{M}$$ is not.
That's the surface you're allowed to do linear algebra on.

![The tangent plane to a surface at a point with several tangent vectors](fig5-tangent-space.svg){: w="400" }
_Figure 5. All the velocity-operators at $$x$$ live in one flat plane (the tangent space $$\mathcal{T}_{x}\mathcal{M}$$). The manifold curves; this little space never does. This is where vectors are allowed to add._

## Your velocities were tangent vectors all along

Now the robotics. Your robot's configuration (every joint angle, the full pose of
its body) is a point on a manifold. As the robot moves, that point traces a
curve through configuration space. Its velocity at any instant is exactly
$$\gamma'(0)$$, a tangent vector. Not a little arrow floating in some ambient Euclidean space,
but the operator that tells you how fast *anything* you care about is changing,
whether that's the distance to the nearest obstacle, the height of the gripper,
or the value of your cost function.

The cleanest example is rotation. Orientations live on the Lie group $$\mathrm{SO}(3)$$, which is curved
(that's exactly why you can't add them).
A velocity there is a rate-of-rotation $$\dot{\mathbf{R}}$$, and carrying it back to the identity (multiplying by $$\mathbf{R}^\top$$) always gives a skew-symmetric matrix.
Those skew matrices are the directions you can rotate in (the tangent space at the identity, written as $$\mathfrak{so}(3)$$ the Lie algebra), and each matrix is actually just three numbers.
Those three numbers are your **angular velocity** $$\omega$$.
Angular velocity was a tangent vector all along;
nobody told you this because in the usual notation the geometry is invisible.

## And your Jacobian is a pushforward

Forward kinematics is a map $$\mathrm{F}$$ that takes joint angles to the pose of the
end-effector, a function between two manifolds. Let me ask the natural question.
If I spin the joints at some rate, how fast does the tip move? You feed a tangent
vector in (joint velocities) and you want a tangent vector out (tip velocity).

The machine that does that conversion is the **differential** of $$\mathrm{F}$$ (written
$$d\mathrm{F}_{x}$$). It takes the directional-derivative idea and applies it to a map that
lands in many dimensions at once. It *pushes a velocity forward* from the input
space to the output space. Write it in coordinates and you get a matrix. That
matrix is the **manipulator Jacobian.**

![A two-link arm: joint rates pushed forward to an end-effector velocity by the Jacobian](fig6-jacobian.svg)
_Figure 6. Joint rates $$\dot{\theta}$$ are a tangent vector in joint space; the tip velocity $$\dot{x}$$ is a tangent vector in the workspace. The Jacobian is the differential $$d\mathrm{F}$$ that carries one to the other; not a grid of partials that happens to work, but the directional-derivative idea applied to a map between curved spaces._

## Back to where we started

Now we address the opening frustrations, one by one.

**Why your library makes you use $$\boxplus$$ instead of $$+$$.**
An optimizer computes an update as a tangent vector. That's what a gradient step is.
But you can't add a tangent vector to a point on a curved space (Figure 1, again).
So the library takes your tangent-space update and *retracts* it back onto the manifold,
usually via the exponential map. That's all $$\boxplus$$ is, "take a step in the
tangent space, then come home to the manifold." It exists precisely because
tangent vectors and points live in different places.

**Why the Jacobian sometimes betrays you.**
At a singularity, the differential $$d\mathrm{F}_{x}$$ loses rank.
It squashes some directions of joint motion to zero tip velocity.
Geometrically, the pushforward stops being able to reach certain
directions in the output tangent space.

![An extended arm at a singularity cannot produce outward velocity](fig7-rank-drop.svg)
_Figure 7. With the arm straight, no combination of joint rates produces velocity straight out along the arm; the same loss of rank you see numerically as the Jacobian going singular._

And "you can't average two rotations" is the very first problem in Figure 1.
Averaging means adding and halving, and addition isn't an operation that the
curved space $$\mathrm{SO}(3)$$ supports. The fix is the same move every time.
Lift to the tangent space, average there where things *are* flat, then retract back.

> A velocity is an operator that differentiates functions.
> That one idea is hiding inside your velocities, your Jacobians, the $$+$$ your library won't let you use,
> and your singularities.
> Learn to see it once, and a surprising number of robotics problems stops being a pile of special cases.

## Where to go next

If this lit something up, these are the books and papers I'd reach for, roughly
in order of how gently they ease you in:

- **Sola, Deray & Atchuthan** — *A micro Lie theory for state estimation in
  robotics.* Written for exactly this audience. If you only read one thing, read
  this; it makes $$\boxplus$$, Jacobians on $$\mathrm{SO}(3)/\mathrm{SE}(3)$$, and retractions concrete.
- **Boumal** — *An Introduction to Optimization on Smooth Manifolds.* Where to
  go once you want gradients, retractions, and the optimization side done properly.
- **Lee** — *Introduction to Smooth Manifolds.* The pure-math home of everything
  here, tangent vectors as derivations, the differential, the works. Heavier,
  but it's the real thing. The book I enjoyed reading the most.
