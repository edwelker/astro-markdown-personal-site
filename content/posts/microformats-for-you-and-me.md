---
title: 'Microformats for you and me'
date: '2007-10-30T20:44:23-05:00'
status: publish
permalink: /2007/10/30/microformats-for-you-and-me
author: Eddie
excerpt: ''
type: post
id: 46
category:
    - microformats
tag:
    - attribute
    - class
    - cons
    - elements
    - hcaleendar
    - pros
    - semantic
    - xhtml
post_format: []
---
After nearly 3 months sitting on my bookshelf, I got around to ![Microformats Logo](../../../../uploads/2007/10/microformats1.png "Microformats Logo")reading [the Microformats book](http://microformats.org/blog/2007/04/19/microformats-the-book/). I probably don't need to mention that they've been pretty high on the "buzz" list for a while now. That aside, I like the idea, and believe they are worth using. With this post, I hope to give a high-level overview of Microformatsâ€¦ first sampling what they are and how to use them, followed by my thoughts on why you should use them.

**What and How**

Very simply, Microformats give our already semantic xhtml elements an extra layer of meaning when using a common set of attribute values. Consider the case of an "[hCalendar](http://microformats.org/wiki/hcalendar)", a microformat that gives xhtml the structure of an events calendar. An events calendar is simply a set of events. This relationship is easily described by a parent-children relationship. The problem is that xhtml can easily describe parent-children relationships, yet it cannot semantically describe this calendar-events relationship. Microformats do just thatâ€¦ they provide a way to describe this common relationship through the use of attribute values.

To create an "hCalendar", you would write something like the following:

> <div class="vcalendar">
> 
> > <span class="vevent"/>  
> > <div class="vevent"/>  
> > <dl class="vevent"/>
> 
> </div>

As you can see, the supplementary calendar-events structure is added by setting specific attribute values, in this case 'vcalendar' and 'vevent'. Microformats use exiting attributes like 'class' and 'rel' as hooks for this structure, in the same way these attributes can be used as hooks for additional CSS information. Additionally, these attributes can be applied to whichever element you choose\*. I demonstrated the use of the same attribute/value pair (class="vevent") on the 'span', 'div', and 'dl' elements in the example above.

\[\* The rules for applying attributes to elements are the same as [the existing xhtml spec](http://www.w3.org/TR/xhtml11/)\]

**Why you should use them**

While I foresee a wide array of future uses for Microformats, there are limited practical applications today. That being said, the small number does not mean they have limited value; their use can provide substantial value. For example: later this week I am going to re-write the [concert-listing page](http://columbiaorchestra.org/season/) for my [ orchestra website](http://columbiaorchestra.org). I am going to use the hCalendar Microformat to code this season's events. I will then use an open-source converter to allow users to download a iCal file of this calendar on the fly.

Why would I do this? Because it's advantageous. Using the hCalendar Microformat I canâ€¦

- provide an additional interface (the iCal file) to my users for free.
- syndicate these events. That way, if I ping a Microformat aware service (like [pingerati.net](http://pingerati.net/)) I will have published these events elsewhere, without any additional work.
- maintain only one source file for multiple outputs (in this case, html, iCal file, and syndicated content)
- use my current knowledge of html as a base for the syntax, requiring me only to learn the Microformats terms and schema before I start using them

There are similar uses for the other Microformats, including hCard (contact info), geo and adr (location/address), XFN (relationships between people), and so on. I invite you to take a look at the [book](http://microformats.org/blog/2007/04/19/microformats-the-book/) or the [Microformats website](http://microformats.org/) for more information.

I hope that's enough to convince you that Microformats are a valid and useful technology. One of the more compelling aspects is [the way Microformats are created](http://microformats.org/wiki/process), yet I think that is interesting enough to warrant it's own post (look for it later). Hope someone out there finds this useful.