---
title: "From WordPress to Hugo to Astro"
date: 2026-01-06T22:40:47
draft: false
description: "How I went from WordPress fatigue to Hugo frustration, and finally found a home with Astro, but we're not sailing through space yet!"
slug: "2026/01/06/wordpress-to-hugo-to-astro"
tags: ["Astro", "Hugo", "WordPress", "Migration", "CSS"]
---

It started with complexity, honestly.

For years, this blog lived on [WordPress](https://wordpress.org/). It was the sane choice at the time, but over time, it became a burden. It was a pain to maintain, constantly demanding updates for plugins I barely remembered installing. Styling it was fighting against a codebase I didn't control. And all of that, I was paying [Dreamhost](https://www.dreamhost.com/) $130 a year.

The result? I just stopped writing. For years. A number of very expensive years.

## The Great Export

In March 2024, I was done. I was getting out. I exported everything from the WordPress database into Markdown files.

That sounds simple, but the reality was a mess. I wrote a slew of python scripts to convert the database Markdown dumps to clean them and correct Markdown. I'd write a script scanning the content directory cleaning one small thing at a time, reviewing, committing, and modifying the script... in order to break as little as possible.

I'm *still* cleaning it—fixing broken images and dead links even tonight. But at least the content is editable again, and safe in git.

## The Hugo Detour

I looked around at alternatives, and chose  [Hugo](https://github.com/edwelker/astro-markdown-personal-site/tree/main). I was excited to learn some Go, and the promise of a static site generator that blazed fast appealed to me. I wanted a theme I could tear apart and extend.  I had considered Pelican, but felt like getting out of my Python wheelhouse (wheelhouse... get it?)

It was going fine for a good long while. I had my markdown corrected, I had a decent theme, and yet...

I hit a wall. I got a basic site up and running, but while trying to add to the site, I kept going around and around trying to figure out if the configuration was part of Hugo, or the theme. And it was frankly confusing. Changing themes? Be prepared to reconfigure the site. Again.

However, at least I stopped paying the $130/yr! I moved everything to Cloudflare's free pages.

## Landing on Astro

So I went searching again and found [Astro](https://github.com/edwelker/astro-markdown-personal-site/).

It wasn't just the architecture; after so much ripgrepping and python scripting being mostly sure these markdown files were correct, having Vite and TypeScript checks, I felt so much better. 

I also really liked/appreciated the template system, which felt close enough to Django to make me happy.

Typescript is fine, more typing than I'm used to in Python, and with a little more friction (in my mind) than a slightly more elegant language, but it gets the job done. Not a big fan of closing braces, but hey, at least it's not XSLT-level verbose. Also, maybe I'm missing something, but the testing infrastructure feels bolted-on, last minute (again, compared to Python).

## The Tailwind Problem

To get this thing shipped, I started with the [Astro Nano](https://github.com/markhorn-dev/astro-nano) theme, intentionally as a base. It’s great, but it’s built on Tailwind CSS.

I know what semantic CSS can do at scale. Back when I refactored PubMed.gov, I refactored thousands of lines of CSS down to a few hundred using something very smiliar to [OOCSS](/tags/css). I then took that codebase over to PubMed Central, which required barely 80 lines of new code. This system worked for over 100 developers because it relied on patterns, not reinventing the wheel every time you needed a button.

Tailwind, on the other hand, feels... gross. Tailwind feels like the opposite of craftsmanship. It’s fast, sure. But cluttering my markup with a soup of utility classes? It destroys readability. It feels like a regression.  It hurts me.

## Future Plans

Ripping it out is next on my list. I want a codebase that feels crafted, not just assembled from a kit. Not sure if I'll go old-school, or try a new framework.

But for now? I'm exploring for free, and pushing boundaries on my [GasPrices](/gas/) page pulling in data into a separate readable repo for scraping, and then on my [SportsFeed](/sports/) page using a Cloudflare worker to pull data on-demand.