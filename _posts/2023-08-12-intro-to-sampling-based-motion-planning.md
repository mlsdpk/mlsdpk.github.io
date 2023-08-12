---
title:  "Introduction to Sampling-Based Motion Planning: The RRT Algorithm"
date: 2023-08-12
categories: [Robotics]
tags: [path planning, algorithms]
comments: true
published: true
---
<div style="display: flex; margin-bottom: 20px;">
    <img src="/assets/img/posts/robotics/empty_map.gif" style="flex: 1; padding-right: 5px;">
    <img src="/assets/img/posts/robotics/map_with_single_cube.gif" style="flex: 1; padding-right: 5px;">
    <img src="/assets/img/posts/robotics/map_with_many_homotopy_classes.gif" style="flex: 1; padding-right: 5px;">
    <img src="/assets/img/posts/robotics/map_with_single_narrow_passage_gap.gif" style="flex: 1;">
</div>

Are you ready to dive into the fascinating world of robots, algorithms, and the art of finding paths through complex terrains? If your answer is a resounding "heck yeah!" then you're in for a treat, because we're about to embark on a journey through the realm of sampling-based motion planning algorithms.
{: .text-justify}

Imagine you're in a maze, and you want to find your way to the exit. Robots face similar challenges when they need to move from point A to point B through complex spaces. Or imagine a robot arm that needs to pick up an object from one location and place it in another location. It's not as simple as connecting the dots on a piece of paper, right? That's where the magic of motion planning comes into play.
{: .text-justify}

In the world of motion planning, there are various types of algorithms floating around in the literature. You might have come across one called A\*. Yep, it falls under the motion planning category too. Some folks even call it a graph-based or graph-search algorithm since it's all about graphs and is used in loads of different applications. Now, compared to these graph-loving algorithms like Dijkstra or A\*, there's a different gang called sampling-based motion planning algorithms. The cool thing is, they don't really need a graph ready to go. They roll with it, building their search graphs and trees on the fly. Plus, they also have many algorithmic advantages over graph-based ones, especially in high-dimensional state spaces. Don't worry if the techie words I just dropped sound like gibberish. I promise, I'll make everything crystal clear as we go through this adventure.
{: .text-justify}

Now, to wrap up this introduction, we're about to unravel the secrets of one of the most accessible and exciting motion planning algorithms in the world of robotics: the RRT Algorithm, or Rapidly-exploring Random Trees for the acronym enthusiasts. As we explore the RRT algorithm, we'll also touch on some cool variations and real-world uses. This algorithm isn't just a theoretical concept – it's a tool that real robots use to move around safely and smoothly. And guess what? This article is just the opening act! We're kicking off a series of articles that won't just stop at RRT – we're diving into the deep end of the algorithm pool to explore the latest and greatest sampling-based techniques. So, get ready to unravel the magic behind the realm of sampling-based motion planning algorithms, especially the RRT algorithm.
{: .text-justify}
