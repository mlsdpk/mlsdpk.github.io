---
layout: page
icon: fas fa-pen
order: 2
permalink: /posts/
---

{% include lang.html %}

{% assign per_page = 10 %}
{% assign page_num  = 1 %}

{% assign all_pinned = site.posts | where: 'pin', true %}
{% assign all_normal = site.posts | where_exp: 'p', 'p.pin != true and p.hidden != true' %}

{%- comment -%}
Combine pinned first, then normal, then take the window for this page.
This mimics your pinned-on-top look without needing `paginator`.
{%- endcomment -%}
{% assign combined = all_pinned | concat: all_normal %}
{% assign visible_start = per_page | times: page_num | minus: per_page %}
{% assign posts = combined | slice: visible_start, per_page %}

<div id="post-list" class="flex-grow-1 px-xl-1">
  {% for post in posts %}
    <article class="card-wrapper card">
      <a href="{{ post.url | relative_url }}" class="post-preview row g-0 flex-md-row-reverse">
        {% assign card_body_col = '12' %}

        {% if post.image %}
          {% assign src = post.image.path | default: post.image %}
          {% unless src contains '//' %}
            {% assign src = post.media_subpath | append: '/' | append: src | replace: '//', '/' %}
          {% endunless %}
          {% assign alt = post.image.alt | xml_escape | default: 'Preview Image' %}
          {% assign lqip = post.image.lqip %}
          <div class="col-md-5">
            <img src="{{ src }}" alt="{{ alt }}"{% if lqip %} lqip="{{ lqip }}"{% endif %}>
          </div>
          {% assign card_body_col = '7' %}
        {% endif %}

        <div class="col-md-{{ card_body_col }}">
          <div class="card-body d-flex flex-column">
            <h1 class="card-title my-2 mt-md-0">{{ post.title }}</h1>

            <div class="card-text content mt-0 mb-3">
              <p>{% include post-description.html %}</p>
            </div>

            <div class="post-meta flex-grow-1 d-flex align-items-end">
              <div class="me-auto">
                <i class="far fa-calendar fa-fw me-1"></i>
                {% include datetime.html date=post.date lang=lang %}

                {% if post.categories.size > 0 %}
                  <i class="far fa-folder-open fa-fw me-1"></i>
                  <span class="categories">
                    {% for category in post.categories %}
                      {{ category }}{% unless forloop.last %},{% endunless %}
                    {% endfor %}
                  </span>
                {% endif %}
              </div>

              {% if post.pin %}
                <div class="pin ms-1">
                  <i class="fas fa-thumbtack fa-fw"></i>
                  <span>{{ site.data.locales[lang].post.pin_prompt }}</span>
                </div>
              {% endif %}
            </div>
          </div>
        </div>
      </a>
    </article>
  {% endfor %}
</div>