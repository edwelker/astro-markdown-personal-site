---
title: 'blurry focus'
date: '2007-09-12T21:23:12-05:00'
status: publish
permalink: /2007/09/12/blurry-focus
author: Eddie
excerpt: ''
type: post
id: 27
categories:
    - ie
    - microsoft
tags:
    - constraints
    - css
    - 'display table'
    - 'table attributes'
post_format: []
---
I've been working on the same project for about 4 weeks now. 4 weeks straight. It's the re-design of certain parts of [a big site](http://www.ncbi.nlm.nih.gov/sites/entrez/) using CSS. Sounds like nothing, but the constraints of the re-design are that it must function almost exactly like the old. Therein lies the difficulty.

It is surprisingly hard to make the new act like the old. I am pretty good with my CSS, but when you have different parts that can expand to huge sizes, both horizontally and vertically, it is quite the challenge. Also, when certain expections have been set by use of tables, it is hard to design around them. There is only one widely supported html tag which can resize a collection of block-level elements similarly, and that would be a table. And yes, I have had to revert to a few tables (with some *crazy* CSS trickery on top).

I have found myself longing for Microsoft to catch up to other browsers, specifically regarding support of [display: table\* attributes](http://www.w3schools.com/css/pr_class_display.asp), but I'm not really sure why I even [looked](http://blogs.msdn.com/ie/archive/2006/08/22/712830.aspx).

Aside from the technical difficulties, my main problem as of late has been focus. I have focused so long and intensely on this one project, it is beginning to blur together. Today I was making mistakes in my code that I would have never normally made. And I had to think...for a rather long time about a conceptual problem concerning whether a certain piece of code should be put in an include, or in the calling source.

I guess I don't really know how "long" is "long" to be working on a project. Something I will have to figure out gradually, I assume. I am glad to be able to recognize the problem, as I can now see if I can work on de-bluring my vision of the project. Maybe it simply requires a different perspective. That being said, one approach that I will take before anything else is to get a good long night's sleep tonight.