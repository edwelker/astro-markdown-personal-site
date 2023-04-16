---
title: 'Pushing Browsers'
date: '2007-09-04T22:59:03-05:00'
status: publish
permalink: /2007/09/04/pushing-browsers
author: Eddie
excerpt: ''
type: post
id: 24
category:
    - firefox
    - ie
    - microsoft
    - standards
tag:
    - css
    - display
    - html
    - 'table cell'
post_format: []
---
So I have been working on a small piece of navigation at work. Tabs, to be exact. Multiple items, but no more than 5 at a time. Variable length titles (including some rather long). As it is a list of links, of course, I wanted to use an unordered list. It all made perfect semantic sense. Just spit out the list, add some CSS for the tab look, and done.

However, there were requirements for its behavior. The tabs were not allowed to wrap around to the next line. They also could not just drift off the right side of the page. Everything had to be shown. And it was alright for the individual tabs to wrap and grow taller. Basically, I was told the nav had to act like a table, just not in so many words.

Because I am likely more standards-driven than most doing similar work, I wanted to stick with the list. Doesn’t make any sense to have non-tabular data in a table, I thought. Within a few minutes, I had found a semi-solution. W3C recommends the display attribute having a "table-cell" property, which was just what I was looking for. Threw it in my code, hit reload in Firefox, and wham, there it was. Needed a slight bit of tweaking, but it was working for the most part. Then I alt-tab’bed over to IE7….

Nothing.

Low and behold, Microsoft hasn’t added that to IE. Of course not. Why would they? It’s only been [in the recommendation since… you know, May 1998](http://www.w3.org/TR/1998/REC-CSS2-19980512/). At least! (I don’t have the heart to look any further back).

I am not "new" as my sister would say… I know how it is. I hadn’t expected it to be there, but the more work I had to do on an alternate table-based solution, the more it annoyed me. I keep hearing more and more about the CSS3 recommendation, adding more elements to HTML 5, and all of these other grand documents, which all currently amount to little-to-nothing. Maybe I am missing the point, but if 1998 is going to be ignored, why should 2008 be any different?

I am going to keep this rant short, the rant wasn’t really the point. The greater point is that was enough of a call-to-action for me. That’s what it took to realize I should start looking into what I can do about giving certain browsers a push in the right direction.Â They seem to be lost.