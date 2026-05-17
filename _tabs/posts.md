---
layout: page
icon: fas fa-pen
order: 2
permalink: /posts/
wide: true
---

{% include lang.html %}

{% assign per_page = 10 %}
{% assign page_num = 1 %}

{% assign all_pinned = site.posts | where: 'pin', true %}
{% assign all_normal = site.posts | where_exp: 'p', 'p.pin != true and p.hidden != true' %}

{% assign combined = all_pinned | concat: all_normal %}
{% assign visible_start = per_page | times: page_num | minus: per_page %}
{% assign posts = combined | slice: visible_start, per_page %}

<ol class="post-list">
  {% for post in posts %}
    <li class="post-list-item">
      <a class="post-list-link{% if post.image %} has-thumb{% endif %}" href="{{ post.url | relative_url }}">
        <time class="post-list-date" datetime="{{ post.date | date: '%Y-%m-%d' }}">
          {{ post.date | date: '%b %-d, %Y' }}
        </time>

        <div class="post-list-body">
          {% if post.categories.size > 0 or post.pin %}
            <div class="post-list-meta">
              {% if post.categories.size > 0 %}
                <span>
                  {% for category in post.categories %}{{ category }}{% unless forloop.last %}, {% endunless %}{% endfor %}
                </span>
              {% endif %}
              {% if post.pin %}
                <span class="post-list-pin"><i class="fas fa-thumbtack"></i> Pinned</span>
              {% endif %}
            </div>
          {% endif %}
          <h2 class="post-list-title">{{ post.title }}</h2>
          <p class="post-list-desc">{% include post-description.html %}</p>
        </div>

        {% if post.image %}
          {% assign src = post.image.path | default: post.image %}
          {% unless src contains '//' %}
            {% assign src = post.media_subpath | append: '/' | append: src | replace: '//', '/' %}
          {% endunless %}
          {% assign alt = post.image.alt | xml_escape | default: 'Preview Image' %}
          <div class="post-list-thumb">
            <img src="{{ src }}" alt="{{ alt }}" loading="lazy">
          </div>
        {% endif %}
      </a>
    </li>
  {% endfor %}
</ol>
