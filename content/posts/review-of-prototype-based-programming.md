---
title: 'Review of &#8220;Prototype-Based Programming&#8221;'
date: '2009-01-29T20:14:56-05:00'
status: publish
permalink: /2009/01/29/review-of-prototype-based-programming
author: Eddie
excerpt: ''
type: post
id: 232
category:
    - books
    - javascript
    - programming
tag:
    - book
    - prototypal
    - prototype
    - review
post_format: []
---
![Prototype-Based Programming](../../../../uploads/2009/01/prototypebasedprogramming.png "Prototype-Based Programming")

I ran across a mention of "Prototype-Based Programming" back when I was first learning JavaScript.Â I thought it would be an interesting read, but forgot to bookmark it, and forgot to look into it further.Â Once I finally remembered it, it proved hard to find (and an expensive gamble from Amazon), until I found it through NIH’s interlibrary loan system.

I was quite excited to get my hands on a copy of this book, I was interested in learning more about the general theory that went into languages with prototypal inheritance.Â I thought this would allow me a special insight into JavaScript.Â However, as I found reading it... despite it’s 1999 publication date, JavaScript wasn’t even mentioned in the book!Â Regardless, I found parts of it to be quite interesting and insightful.

The book is broken up into three sections (as mentioned on the cover), Concepts, Languages, and Applications.Â Each section has 4 associated chapters which are really various papers, some of which seem to be difficult to find elsewhere.

The first section, "Concepts" was the most interesting. The first was titled "Classes vs. Prototypes: Some Philosophical and Historical Observations."Â This chapter provided a nice introduction to the topic, including the history of classification, going back to Aristotle and proceeding to Ludwig Wittgenstein who had an interesting example about classifying the characteristics of an item as simple as a "game".Â It goes on to transition to a programming perspective.Â A point that is made repeatedly throughout many chapters that the idea of classical inheritance necessitating construction from the top (superclasses) to the bottom (subclasses) is inherently contradictory to the way humans think.Â When unfamiliar with a domain, a person can more easily deal with concrete examples, and only discern the abstract general form after discovering these patterns in the concrete cases.Â Though unable to put my finger on this idea, I’ve experienced it a number of times when programming myself, and couldn’t agree more.

The next chapter, "Classifying Prototype-based Programming Languages" sought to categorize the theoritical aspects of different prototypal languages.Â This is the chapter where I most missed the reference to JavaScript, but I may look into doing that myself some other day.Â "The Stripetalk Papers: Understandability as a Language Design Issue in Object-Oriented Programming Systems", made an argument that prototype based systems could be used to enhance the learnability of languages.Â Finally, the chapter "Classes versus Prototypes in Object-Oriented Languages" looked at the advantages and disadvantages of class-based and prototype-based languages.Â This chapter was quite interesting, however brief.

The second section, "Languages", lacking JavaScript, was less useful than I had hoped.Â "Programming as an Experience: The Inspiration for Self" was interesting as it described the thought process going into creating the Self language, and expanded some of the ideas presented in the book’s second chapter.Â Alas, I’ve haven’t yet gotten around to learning Self, but the ideas and history presented were interesting in the abstract.Â "NewtonScript: Prototypes on the Palm" was interesting mostly because of it’s Lisp-like syntax and it’s description of internal closures, while "The Prototype-Instance Object Systems in Amulet and Garnet" took an in-depth look at the implementation of these two languages.Â I only skimmed the "Omega: Statically Typed Prototypes" chapter, as it was rather brief, and I don’t feel confident enough (or have any real desire) to enter the static-typed/dynamic-typed languages argument.

The final section, "Applications", was where this book showed it’s age.Â "Self includes: Smalltalk" involved translating Smalltalk programs into Self, which is interesting, but I don’t see much practical application for this today (maybe if you’re translating Ruby to JavaScript? Not sure).Â "Using Prototypes for Program Restructuring" demonstrated the use of an algorithm that would help to restructure code into a slot-based prototype system in a application called Guru.Â "Prototype-Based Programming for Abstract Program Visualisation" ended up being skimmed, because while the topic matter seemed interesting, the demonstrations from the black-and-white mac era looked totally antiquated, and I am sure that they have been written many times in other languages since the writing.Â Finally, "Agora: The Scheme of Object-Orientation, or, the Simplest MOP in the World" detailed the Agora language, a pure OO language which relied only on objects and message passing, while being implemented as a reflective language inspired by Scheme, of all things. Weird, but interesting.

You know as well as I do that computer technology is a moving target, and something published in 1999 will be outdated to a certain degree.Â The good part of this book is that the abstract notions in it are rather timeless, as they have been built on over time.Â Parts of this book may be out of date, but parts aren’t, and regardless, it’s an interesting read.Â I recommend it, if you’re even slightly interested.