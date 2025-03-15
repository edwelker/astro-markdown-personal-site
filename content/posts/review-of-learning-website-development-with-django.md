---
title: 'Review of "Learning Website Development with Django"'
date: '2008-07-07T23:09:03-05:00'
status: publish
permalink: /2008/07/07/review-of-learning-website-development-with-django
author: Eddie
excerpt: ''
type: post
id: 92
categories:
    - books
    - django
    - programming
    - python
    - web
tag:
    - application
    - 'application framework'
    - 'ayman hourieh'
    - book
    - development
    - website
post_format: []
---
[![Cover, Learning Website Development with Django](/learningwebsitedjango.jpg "Cover, Learning Website Development with Django")](http://www.packtpub.com/django-website-development-tutorial/book)Over the past few weeks, I've been playing around with Django. Because of that, I've been looking at a few different books on the subject. I first started out with the [Django Book](http://www.djangobook.com/en/1.0/), which took me a few days to read. I can't say I absorbed it all, but I got the general idea. Then I decided to look into other books and found [*Learning Website Development with Django*](http://www.packtpub.com/django-website-development-tutorial/book), by [Ayman Hourieh](http://aymanh.com/).  I started right away.

The book's subtitle, "*A beginner's tutorial to building web applications, quickly and cleanly, with the Django application framework*," frames the book perfectly. Its target audience is programmers (moderately) familiar with Python, but who are, at the same time, new to Django. The book is really focused towards this audience. The other key word in the subtitle is "quickly." This book moves along in a hurry while creating the demonstration app. I was quite comfortable (and pleased) by the pace, however, I can imagine that a more novice programmer may have a harder time dealing with the information flying by.

The book centers on building one app, a social bookmarking website similar to [del.icio.us](http://del.icio.us/), or ma.gnolia. I think type of site was a good choice, since it provides the author with a varying degree of complexity to play around with. It allowed Mr. Hourieh to start with the basics. This book succeeds in starting simple and getting harder as it goes along. I also thought it was good to focus on creating just one website, rather than a bunch of mini-projects or examples, since it models a more real-life situation. The idea of a social bookmarking website, as well, is very useful because its features are currently *en vogue*, and can be found on many current sites.

Chapters One and Two are the obligatory "what is Django" and "how to install" chapters. The meat of the book starts in Chapter Three when the project is introduced.  By the end of this third chapter, we've already quickly written three database models (Links, Users, and Bookmarks) and the main page. Chapter Four introduces Django's built-in user authentication system (django.contrib.auth), and describes how to write login, logout, and registration pages. Chapter Five instructs us to write an additional database model (tags), which is more complex than the models we wrote previously. Here we also write pages to display the list of bookmarks, bookmarks by tags, and a tag cloud. \[To illustrate how fast we're moving, Chapter Five ends on page 91\]

Mr. Hourieh adds occasional asides throughout *Learning Website Development with Django,* such as one on security at the end of Chapter Five. Personally, I'd have liked to see more of these, but I think he consciously limited the number to better suit the book's audience.

Chapter Six introduces AJAX behaviors, using the jQuery library. The author includes a lightning-fast tutorial on jQuery. The reader is then shown how to implement a live search display, in-place bookmark editing, and a tag auto-complete feature. Chapter Seven adds both a voting and commenting system to our application. The user writes a new database model (Shared Bookmark), and shows how to implement comments piggy-backing on Django's built-in comment system (django.contrib.comments).

In Chapter Eight, we are finally introduced to Django's built-in Administration Interface (django.contrib.admin), and the reader is shown how to customize the admin pages and deal with user permissions. Chapter Nine describes adding RSS feeds, Pagination, and advanced search capabilities to our application. We're taught how to create advanced model queries using both the objects.filter() function and Q objects to build multi-faceted queries.

Chapter Ten focuses on adding a "Friend" data model to the application. This chapter demonstrates how Django can be used to send email (friend 'invites' in this case), and how the bookmark application can be used to handle activation links. Chapter Eleven covers three topics; language translation, caching, and unit testing. None of these are as "flashy" as the previously covered topics, but they are given adequate mention. The final chapter, Chapter Twelve mentions a number of advanced topics that the reader is left to research on his/her own.

The book is generally well written. I like the structure. The chapter beginnings outline a plan for implementation, and the remainders proceed step-by-step. I would have liked the writing to have been polished a little more. The language seems too formal in places, and when you mix in a number of technical ideas, the language can distract. This however, may just be a personal preference.

The more I think about *Learning Website Development with Django*, the more I like it. It is well suited for someone who wants to get off the ground quickly; someone who needs to get something done and can worry about the details when they need to. It's not a bible, but it's not trying to be, and I think that's where it really succeeds.