---
title: 'Firefox for Mac and displaying small font sizes'
date: '2007-10-25T15:19:27-05:00'
slug: 2007/10/25/firefox-for-mac-and-displaying-small-font-sizes
tags: ["bug report", "css", "firefox", "macosx", "microsoft", "mozilla", "opera", "pixel", "typography"]
---
So I had a problem a while back where I thought Firefox for Mac was picking up some left-over or un-overridden size styles, while the other browsers were not. It turns out that it wasn't actually my problem.

While all of the other browsers that I tested... for both Windows and Mac display the default font (serif) set to .8em as glyphs that are 9 pixels tall, Firefox for Mac displays glyphs that are 8 pixels tall, but with 1 pixel of anti-aliasing on top. The difference of one pixel usually doesn't mean much, but when dealing with font-sizes that small, it makes a big visual difference.

I submitted a Mozilla bug report which has not yet been picked up, but I'm not sure if there's anything to be done, especially if the rendering engine is at all based on the system software (doubtful, since none of the other browsers work the same way). I wonder if the release of MacOSX Leopard is going to affect this.

Gotta love the Mozilla people, though. It's such a relief that you can even submit a bug report for something like this. A chance for actual interaction, and a chance to better the product. I only wish Microsoft would pay a little attention.