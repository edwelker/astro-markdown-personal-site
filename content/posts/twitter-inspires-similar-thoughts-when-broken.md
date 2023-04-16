---
title: 'Twitter inspires similar thoughts (when broken!)'
date: '2008-01-20T12:15:03-05:00'
status: publish
permalink: /2008/01/20/twitter-inspires-similar-thoughts-when-broken
author: Eddie
excerpt: ''
type: post
id: 67
category:
    - twitter
tag:
    - client
    - decentralization
    - 'decentralized service'
    - distributed
    - macworld
    - 'macworld keynote address'
    - servers
    - storage
post_format: []
---
First, I just watched what can only be described as a "herd" of squirrels, run across a neighbors front lawn. I've seen one chase another before, but I have never seen 5 all move together with a direction change. Very odd. Anyway...

A few days ago, I questioned in passing, when [Twitter](http://twitter.com "twitter.com") would start operating as a decentralized service. I asked because it was down at the time (outages are annoying, and I was bored). Apparently it was due to the [MacWorld keynote address](http://www.techcrunch.com/2008/01/15/twitter-fails-macworld-keynote-test/)... so basically, Apple did it. Who cares, I was still bored. My friends were probably doing something amazing...

My two-second solution to the outages (and my current boredom) was decentralization of Twitter. And apparently, I [was not](http://dembot.com/post/23874410) [the only](http://www.scripting.com/stories/2008/01/16/aDecentralizedTwitter.html) [one](http://www.russellbeattie.com/blog/decentralized-twitter-thoughts). Some questioned twitter's usefulness as an emergency alert system. (My gut tells me that system wouldn't work. In an emergency, most will grab their phones, not run to post a tweet. Also, there's [no way I'm paying $20 for "industrial twitter." ](http://blogs.zdnet.com/BTL/?p=7614) Anyway, I digress...)

There were also a few implementation ideas tossed around. I would implement based on a bittorrent model. You want your friends updates (call him friend B). You both have friend A in common, and friend A has friend B's updates. There are now two places to obtain friend B's updates. Voila. What about storage... what happens when you don't want to hold all of my 1700 updates? Well, that's where a few redundant twitter history servers pick up the slack, and algorithms figuring out when they start picking that slack.

\[there are those squirrels again!\]

Protected permissions would have to be dealt with, so give the client instructions to handle them. And I do mean client. Extend [twitterific](http://iconfactory.com/software/twitterrific) or a similar program, they would be fine for such a task \[though I may leave phone-based clients out\]. Why use a client instead of a dedicated server? One of twitter's biggest draws is ease of use. Lets keep it that way... installing a server app is annoying to some, impossible to others.

I may have overlooked some flaws, but the basic model seems alright to me. A social network like this seems tailor-made for a distributed model.

So those are my two cents. Which I'm only spending so that I'm not bored when twitter is down.