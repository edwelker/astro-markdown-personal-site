---
title: "From WordPress to Hugo to Astro"
date: 2026-01-06T22:40:47
draft: false
description: "How I went from WordPress fatigue to Hugo frustration, and finally found a home with Astro, but we're not sailing through space yet!"
slug: "2026/01/06/wordpress-to-hugo-to-astro"
tags: ["Astro", "Hugo", "WordPress", "Migration", "CSS"]
---

<!-- [&_p]:contents removes the <p> wrapper Markdown adds to images, allowing the parent div to control layout. -->
<div class="float-right ml-2 mb-2 [&_img]:h-16 [&_img]:w-auto [&_p]:contents">

![WordPress Logo](./wordpress.svg)

</div>

It started because of the complexity, honestly.

For years, this blog ran on [WordPress](https://wordpress.org/). It was the sane choice at the time, but over time, it became a burden. It was a pain to maintain, constantly demanding updates for plugins I barely remembered installing. Styling it was fighting against a codebase I didn't control. And all of that, I was paying [Dreamhost](https://www.dreamhost.com/) $130 a year.

The result? I just stopped writing. For years. A number of very expensive years.

## The Great Export

In March 2024, I was done. I was getting out. I exported everything from the WordPress database into Markdown files.

That sounds simple, but the reality was a mess. I wrote a slew of python scripts to convert the database Markdown dumps to clean them and correct Markdown. I'd write a script scanning the content directory cleaning one small thing at a time, reviewing, committing, and modifying the script... in order to break as little as possible.

I'm *still* cleaning it, fixing broken images and dead links even tonight. But at least the content is editable again, and safe in git.

## The Hugo Detour

<div class="float-right ml-2 mb-2 [&_img]:h-16 [&_img]:w-auto [&_p]:contents">

![Hugo Logo](./hugo.svg)

</div>

I looked around at alternatives, and chose  [Hugo](https://github.com/edwelker/astro-markdown-personal-site/tree/main). I was excited to learn some Go, and the promise of a static site generator that blazed fast appealed to me. I wanted a theme I could tear apart and extend.  I had considered Pelican, but felt like getting out of my Python wheelhouse (wheelhouse... get it?)

It was going fine for a good long while. I had my markdown corrected, I had a decent theme, and yet...

I hit a wall. I got a basic site up and running, but while trying to add to the site, I kept going around and around trying to figure out if the configuration was part of Hugo, or the theme. And it was frankly confusing. Changing themes? Be prepared to reconfigure the site. Again.

However, at least I stopped paying the $130/yr! I moved everything to Cloudflare's free pages.

## Landing on Astro

<div id="listing-image" class="float-right ml-2 mb-2 [&_img]:h-16 [&_img]:w-auto [&_p]:contents">

![Astro Logo](./astro.png)

</div>

So I went searching again and found [Astro](https://github.com/edwelker/astro-markdown-personal-site/).

It wasn't just the architecture. After wading through the muck of a messy content migration, ripgrepping and scripting until my eyes bled, the speed of Vite and the safety net of TypeScript felt like a warm blanket.

I also really appreciated the template system. It felt like the MVC frameworks I grew up on. It reminded me enough of Django to make me happy.

TypeScript is... fine. It's more typing than Python, and it feels like it has more friction than the elegant languages I prefer, but it works. I hate the closing braces, it's not XSLT, but it's not Python whitespace either. And the testing? It feels bolted-on compared to pytest, but maybe that's just me.

## The Tailwind Problem

To get this thing shipped, I started with the [Astro Nano](https://github.com/markhorn-dev/astro-nano) theme. It’s great, but it’s built on Tailwind CSS.

Look, I championed [OOCSS](/tags/css). Back when we refactored PubMed.gov, we crushed thousands of lines of CSS down to a few hundred using patterns. We ported that to PubMed Central with barely 80 lines of new code. That system worked for over 100 developers because it relied on architecture, not reinventing the wheel every time you needed a button.

Tailwind feels like the opposite. It feels gross. Cluttering my markup with a soup of utility classes? It destroys readability. It feels like a regression. It hurts my soul.

## Future Plans

Ripping it out is next on my list. I want a codebase that feels crafted, not just assembled from a kit.

But for now? We’re live. It’s fast. It’s free. And I'm actually having fun pushing boundaries, like my [GasPrices](/gas/) page that pulls data into a readable repo, or my [SportsFeed](/sports/) that uses Cloudflare Workers to fetch data on-demand.