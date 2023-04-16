---
title: 'IE 6 background flicker problem revisited'
date: '2007-08-21T14:20:56-05:00'
status: publish
permalink: /2007/08/21/ie-6-background-flicker-problem
author: admin
excerpt: ''
type: post
id: 13
category:
    - ie
    - microsoft
tag:
    - 'background image'
    - flicker
    - 'internet explorer'
    - 'server settings'
post_format: []
---
So I fell into the (now famous to me) Internet Explorer 6 background-image flicker problem. Oh, fun times. There have been a few different solutions presented, ranging from [javascript](http://evil.che.lu/2006/9/25/no-more-ie6-background-flicker) to [server settings](http://dean.edwards.name/my/flicker.html) (or my favorite \[sarcasm\], to put the background-image on a copy of itself so you don’t see the flicker). The problem is that I was using a pre-SP1 IE, so the javascript solution wouldn’t work, and I did not have access to the server.

After my testing, I’ve found that the statement of the problem isn’t quite correct. Most say that is whenever you put a background-image style on a link. This isn’t quite accurate. The problem I have observed is:

*When a background-image style is applied to either a DOM element with an event attached to it, or to any of its children.*

This makes it a wider problem than I had originally thought. The one caveat I have found is that an inline event (for example, an ‘onclick’ attribute written in the <element>) will not trigger this effect.

The thing that amazes me about this, and worries me about those trying to apply a duplicate background-image to hide the flicker, is that every mouseover is causing another server hit for that image. It seems incredible that individuals and companies can just turn a blind eye to this. I would be inclined to send Microsoft an invoice…

*Postscript:* I used [Fiddler](http://www.fiddlertool.com/fiddler/) which was a really big help testing for this. Turns out it is owned by Microsoft. Anyone sensing any guilt there???