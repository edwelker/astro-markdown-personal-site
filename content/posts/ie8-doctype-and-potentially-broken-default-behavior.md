---
title: 'IE8, Doctype and potentially broken default behavior'
date: '2008-01-22T11:21:53-05:00'
status: publish
permalink: /2008/01/22/ie8-doctype-and-potentially-broken-default-behavior
author: Eddie
excerpt: ''
type: post
id: 69
category:
    - ie
    - ie8
    - microsoft
    - standards
tag:
    - 'backwards compatibility'
    - css
    - doctype
    - ie7
    - metatag
post_format: []
---
I woke up this morning and read the A List Apart articles (that I defered reading until this a.m.). Â The powers that be have decided that [IE will now use a metatag to decide what rendering type](http://alistapart.com/articles/beyonddoctype)Â (ie6,Â ie7,Â ie9, etc.) to use. Â This allows for backwards compatibility. Â Supposedly.

First,Â IÂ don’tÂ reallyÂ careÂ aboutÂ theÂ meta.Â Â It’sÂ fine…Â itÂ isÂ just one more trick to add to the pile. Generally, I agree with [Eric Meyer’s points](http://alistapart.com/articles/fromswitchestotargets), that it’sÂ betterÂ thanÂ browserÂ switching.Â Â AndÂ itÂ is.Â Â It’s also better than conditional CSS comments.

There are a few problems that I see, however. The first one was actually thrown into my lap as a twitter discussion between [Jeremy Keith](http://adactio.com/) (down-to-earth web guy) and [Chris Wilson](http://blogs.msdn.com/cwilso/) (worksÂ onÂ IE). Following the twitter-timeline, [first](http://twitter.com/adactio/statuses/627930532), [second](http://twitter.com/cwilso/statuses/628255922), [third](http://twitter.com/adactio/statuses/628305212). Apparently the default behavior for rendering a document with a HTML 4.01 doctype will be IE7. That’s right, it doesn’t fall through, it will be stuck on IE7. That is just wrong. Hopefully, bothÂ JeremyÂ andÂ Chris and the other powers that be work that detail out further before Microsoft proceeds.

My second worry is the case of "edge." Edge, as far as I am concerned, stands for &lt;i&gt;bleeding edge&lt;/i&gt;, and that implies an experimental version, where results will be unpredictable.Â Â (IÂ inferÂ thatÂ definitionÂ basedÂ onÂ everyÂ otherÂ softwareÂ releaseÂ thatÂ I’ve heard of.) Hopefully that’s not the case, but there sure as heck better be a concrete definition of what they consider "edge". Â Hopefully they’ll throw a "current major version" in there as well. Â Who knows.

The third, and probably largest concern that I have, is that we are now relying on Microsoft to include past browser rendering attributes into current browsers. So IE8 should be able to render all of IE7’s quirks, as well as IE6’s quirks. Based on the fact that Microsoft had a hard time fully flushing out all of the CSS standards for so long, whats to say that that they’ll accomplish this in full. Additionally, there are the worries that including past rendering attribues will yeild the "bloatware" that Eric mentioned.

And finally (at least for today) there’s the mess of doctype and meta. Â Now you get to define things in both places. Â It’s just sortof kludgy. Â One more thing that I have to memorize, and I hate memorizing things.

Anyway, it’s Day one of this stuff, and there will be much discussion to come, and I’m guessing a lot of other stuff as well.