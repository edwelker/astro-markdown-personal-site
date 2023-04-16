---
title: 'Using the label element for form accessibility'
date: '2008-03-09T23:24:38-05:00'
status: publish
permalink: /2008/03/09/using-the-label-element-for-form-accessibility
author: Eddie
excerpt: ''
type: post
id: 78
category:
    - accessibility
    - firefox
    - usability
    - web
tag:
    - bug
    - css
    - element
    - form
    - html
    - label
    - screenreader
post_format: []
---
I’ve always been a fan of the <label> element. It’s an incredibly simple way to make a form more accessible. It does two things:

- It explicitly associates text with a form element, so a screenreader doesn’t have to guess what text goes with what form element.
- For checkboxes/radio buttons, it gives the user a larger click area, which is useful for people with limited vision (or me, since I always end up missing them!)

You can find a number of simple usage examples on the [<acronym title="World Wide Web Consortium">W3C</acronym>‘s <acronym title="Web Content Accessibility Guidelines">WCAG</acronym> Techniques page for labels](http://www.w3.org/TR/WCAG20-TECHS/H44.html).

I recently discovered something new about the <label> element (new to me). I hadn’t realized that you can associate **multiple labels** to one form element. This is useful because it allows you to associate even more information with a form element. With it, I could write something like this:

```
<label for="box">1. </label>

<input type="checkbox" id="box"/>

<label for="box">This is some text with a 
```

```
<abbr title="full title name">shrt. title</abbr> other stuff inside.</label>
```

This isn’t the most useful example, but I think it demonstrates the general idea. \[Note: normally, I wouldn’t write out an explicit number, I would use an unordered list. But without major support for [CSS counters](http://www.w3.org/TR/REC-CSS2/generate.html#counters "CSS Counters"), I find myself between a rock and a hard place.\] My optimism was quickly quashed though, because, as [Roger Johansson mentions, screenreaders tend to ignore two labels](http://www.456bereastreet.com/archive/200711/use_the_label_element_to_make_your_html_forms_accessible/). I will have to do some of my own testing to find out more, but I find this very disappointing.

Another interesting application is to include labels for screenreaders, while using CSS to hide them from visual users. Just make your label a block element, give it a 0 width (to remove the width it would have taken in the document flow), and move it off-screen. You cannot simply `display: none` the label, as that usually hides it from screenreaders. I would like to look further into the end result using current technology ([hoping for improved results since 2004](http://juicystudio.com/article/invisible-form-prompts.php)), but I certainly believe this leaves **no excuse** for anyone NOT including labels in their forms.

Back to using one label again, I ran into a [Firefox Bug where a link is included in a label element](https://bugzilla.mozilla.org/show_bug.cgi?id=163912). When a link is clicked inside a label element that is associated with a checkbox, the checkbox becomes checked! Hit the back button, and the item will still be checked, with the visual check the only evidence anything happened. You can see how this would not be friendly to a screenreader (not to mention visual users!) IE and Opera both behave without checking the box. If you have a moment, [*please vote for this bug*](https://bugzilla.mozilla.org/show_bug.cgi?id=163912) and help me get it fixed.

P.S. – when I mention "hoping" to test further, I mean when my Jaws activation FINALLY gets worked out.