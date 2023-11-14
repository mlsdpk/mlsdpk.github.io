---
title:  "Introduction to Sampling-Based Motion Planning: The RRT Algorithm"
date: 2023-08-12
categories: [Robotics]
tags: [path planning, algorithms]
comments: true
published: true
math: true
---
<div style="display: flex; margin-bottom: 20px;">
    <img src="/assets/img/posts/robotics/empty_map.gif" style="flex: 1; padding-right: 5px;">
    <img src="/assets/img/posts/robotics/map_with_single_cube.gif" style="flex: 1; padding-right: 5px;">
    <img src="/assets/img/posts/robotics/map_with_many_homotopy_classes.gif" style="flex: 1; padding-right: 5px;">
    <img src="/assets/img/posts/robotics/map_with_single_narrow_passage_gap.gif" style="flex: 1;">
</div>

<!-- Are you ready to dive into the fascinating world of robots, algorithms, and the art of finding paths through complex terrains? If your answer is a resounding "heck yeah!" then you're in for a treat, because we're about to embark on a journey through the realm of sampling-based motion planning algorithms.
{: .text-justify}

Imagine you're in a maze, and you want to find your way to the exit. Robots face similar challenges when they need to move from point A to point B through complex spaces. Or imagine a robot arm that needs to pick up an object from one location and place it in another location. It's not as simple as connecting the dots on a piece of paper, right? That's where the magic of motion planning comes into play.
{: .text-justify}

In the world of motion planning, there are various types of algorithms floating around in the literature. You might have come across one called A\*. Yep, it falls under the motion planning category too. Some folks even call it a graph-based or graph-search algorithm since it's all about graphs and is used in loads of different applications. Now, compared to these graph-loving algorithms like Dijkstra or A\*, there's a different gang called sampling-based motion planning algorithms. The cool thing is, they don't really need a graph ready to go. They roll with it, building their search graphs and trees on the fly. Plus, they also have many algorithmic advantages over graph-based ones, especially in high-dimensional state spaces. Don't worry if the techie words I just dropped sound like gibberish. I promise, I'll make everything crystal clear as we go through this adventure.
{: .text-justify}

Now, to wrap up this introduction, we're about to unravel the secrets of one of the most accessible and exciting motion planning algorithms in the world of robotics: the RRT Algorithm, or Rapidly-exploring Random Trees for the acronym enthusiasts. As we explore the RRT algorithm, we'll also touch on some cool variations and real-world uses. This algorithm isn't just a theoretical concept – it's a tool that real robots use to move around safely and smoothly. And guess what? This article is just the opening act! We're kicking off a series of articles that won't just stop at RRT – we're diving into the deep end of the algorithm pool to explore the latest and greatest sampling-based techniques. So, get ready to unravel the magic behind the realm of sampling-based motion planning algorithms, especially the RRT algorithm.
{: .text-justify} -->

The primary motivation for developing the RRT algorithm is to address kinodynamic systems in high-dimensional state spaces. These systems usually aim to generate open-loop trajectories that satisfy global obstacle constraints and local differential constraints, which are valuable in a wide variety of robotic applications. I won't dive into too many details on the literature here, but if you are interested, I highly encourage you to read the original RRT papers [1][2]. There, you can find an extensive literature review and a solid background on how the authors' ideas are built on a large foundation of related research.
{: .text-justify}

The objective behind the algorithm is to naturally extendable to any general high-dimensional problems that may involve differential constraints. Compared to multi-query variants (i.e., multiple goal inputs or configurations) such as probabilistic roadmaps (PRMs), RRTs only aim to address single-query efficiently without any preprocessing requirments of the environment.

## Notes on definitions and notations used

First, I'd like to start off the discussion by addressing the notation on state space. In robotics, especially in the motion planning community, the terms "**configuration space**" (also known as C-space) and "**state space**" are often used interchangeably, but they are not the same.

State space typically refers to the set of all possible states that a system can be in. For example, in the context of robotics, a state might include the positions and velocities of all the joints in a robotic arm. It's essentially a representation of the complete snapshot of the system at a given moment.

On the other hand, the configuration space, also referred to as C-space, is a bit more specialized. It specifically refers to the set of all possible configurations that a system can have, without considering the details of how the system moves between configurations. In simpler terms, it's a more abstract representation that focuses on the different possible arrangements of the system.

We use the notation $C$ to denote the configuration space (C-space). The expression $q \in C$ is commonly used to represent a configuration of a system within C-space. The symbol $X$ is used to represent the state space, in which a state, $x \in X$, can be expressed as $x = (q, \phantom{.}\smash{\dot{q}}, \phantom{.}\smash\ldots)$, i.e., it may include higher order derivatives as necessary, depending on the problem's state space.


## References
[1] LaValle, S. (1998). Rapidly-exploring random trees: A new tool for path planning. Research Report 9811.

[2] LaValle, S. M., & Kuffner Jr, J. J. (2001). Randomized kinodynamic planning. The international journal of robotics research, 20(5), 378-400.

[3] Kuffner, J. J., & LaValle, S. M. (2000, April). RRT-connect: An efficient approach to single-query path planning. In Proceedings 2000 ICRA. Millennium Conference. IEEE International Conference on Robotics and Automation. Symposia Proceedings (Cat. No. 00CH37065) (Vol. 2, pp. 995-1001). IEEE.
