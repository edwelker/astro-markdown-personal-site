---
title: 'Review of High Performance Web Sites'
date: '2007-11-19T00:27:28-05:00'
status: publish
permalink: /2007/11/19/review-of-high-performance-web-sites
author: Eddie
excerpt: ''
type: post
id: 52
category:
    - books
    - firefox
tag:
    - firebug
    - 'high performance web sites'
    - 'load time'
    - performance
    - speed
    - 'web site'
    - yslow
post_format: []
---
When I came across [![High Performance Web Sites Cover](http://www.oreilly.com/catalog/covers/9780596529307_cat.gif "High Performance Web Sites Cover")](http://www.oreilly.com/catalog/9780596529307/)[High Performance Web Sites; Essential Knowledge for Frontend Engineers](http://www.oreilly.com/catalog/9780596529307/) on Amazon, I was excited. I've been actively using the [Yslow plugin](http://developer.yahoo.com/yslow/) for [Firebug](http://www.getfirebug.com/), and was interested in finding out more. At the day job I can't implement each of the 14 rules myself, however the plugin is useful none-the-less. It's terrific to have a checklist to work off of when entering QA mode, that way you're sure not to forget anything.

For those who are not familiar with Yslow, it is (again) a plugin for the firebug, the addon for [Firefox](http://www.mozilla.com). It tests a website based on [14 varying rules](http://developer.yahoo.com/performance/rules.html), from server settings to page construction. There are a few on the list that most people haven't heard of, yet are rather important (I had never heard of an ETag much less known what to do with one). When Yslow came out, I took a peek at [the best practices document](http://developer.yahoo.com/performance/rules.html) which briefly explained each of the rules. I wanted to find out more, so I ordered the book. Unfortunately, High Performance Web Sites let me down for just that reason. I didn't find out much more.

High Performance Web Sites starts off with a table listing [alexa](http://alexa.com/)‘s top 10 U.S. websites (substituting AOL.com for craigslist.org). Then, 14 chapters (one for each rule) are devoted to explaining the rule, and showing how many of the top 10 are implementing it. The final chapter steps through the 10 websites and shows what they do to reduce the load time of their websites.

My problem was that the book really didn't offer any new information. Basically, the best practices document was explained in slightly greater depth...but only slightly. I was disappointed to find out that there were very few additional ideas in the book... apparently the 14 rules cover the possibilities of writing faster-loading websites (ahem). The chapter analyzing the ten major websites had a ton of room for furthering ideas, but offered a limited few.

I was most disappointed in the book because I had looked forward to more. The plugin itself, and the list of rules are both terrific. Having a concise set of tests to walk through is extremely valuable. I can not say the same for the book. I hope my money went towards further work, yet I wonder how that's being filtered through O'Reilly (the publisher) and Yahoo (the official creator of Yslow). I recommend reading [the Yslow best practices](http://developer.yahoo.com/performance/rules.html), and taking a look at [the Yslow user guide](http://developer.yahoo.com/yslow/help/) instead.