---
title: 'XSLT Class'
date: '2007-10-23T22:07:13-05:00'
slug: 2007/10/23/xslt-class
tags: ["functional programming", "mulberry technologies", "xslt"]
---
Last Monday through last Wednesday I attended [Mulberry Technologies' XSLT course](https://mulberrytech.com/). I had a fun time, and learned a bunch.

To prepare, I looked through a few books. I looked through Jeni Tennison's *Beginning XSLT 2.0* book, but it wasn't for me. I didn't like how wordy it was... I got lost in the dialogue, and it distracted me from the points and the examples. On the otherhand, [Doug Tidwell](https://www.oreillynet.com/pub/au/749)'s book, *XSLT-Mastering XML Tranformations* was precisely what I was looking for. It was concise and organized very methodically. PLUS, it only cost me $7 with shipping from Amazon. Heh, gotta love that!

\[note: because we only use 1.0 on the job, older books were better, as I didn't have to figure out what was a 2.0 feature and what was a 1.0 feature... and again, the books were cheaper\]

Fun stuff aside, XSLT is a pretty cool language. I'm too new to it to debate if it is a functional programming language or simply based on those attributes, but I'm happy to get to play with its functional aspects. I am kinda thrilled to dust off my recursive-function-writing skills. I hope to use it early and often, so I can get a good amount of practice in.

The class was useful because it showed me things I didn't pick up from the books. First was the concept that the root node is placed above what I called the XML root node. The class called the XML root node the "document node." Solved one problem that I had been having. The other really enlightening aspect was the axes. When I read the book and saw that there 13, I simply skimmed it. It was good to sit down with , as the following:: and preceding:: axes were not what I thought.

Debbie Lapeyre and Wendell Piez, the instructors, were great and worked with us to answer all of our questions... even my weird set theory questions. Wendell, in particular (because he led the third day) was helpful, showing me some of the common "hacks" people use to make 1.0 do things it wasn't intended to do \[despite my incredibly poorly phrased question!\]. Now that I can understand XPath a little better, I can break down the pieces of the hacks... so things like the Muenchian method actually make sense now.

Hopefully I will get to keep working with XSLT's, I'm definitely not an expert from three days. But since they're core to the portal system I work with, I expect to get a lot more practice in. If I get good enough, I'd love to post some information that may be useful to others. Stay tuned!