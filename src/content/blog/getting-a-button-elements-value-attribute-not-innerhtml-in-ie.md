---
title: "Getting a button element's value attribute (not innerHTML) in IE"
date: '2008-05-23T00:52:25-05:00'
slug: "2008/05/23/getting-a-button-elements-value-attribute-not-innerhtml-in-ie"
tags: ["attribute", "attributes array", "button", "element", "internet explorer", "javascript", "microsoft", "value"]
---
After spending a small part of my evening debugging Javascript in IE (which is ALWAYS a pleasure), I found out one of my errors was a mistake I had made before... trying to access button.value in IE. IE, of course, being IE, returns the innerHTML value of the button, instead of the value attribute. Last time I ran into this, I used a class instead of value, and moved on with my life. Tonight, I was feeling stubborn, and I found a better way...

target.value = target.getAttributeNode('value').nodeValue;

I'm sure I'm about the millionth person to discover this, but I couldn't find it anywhere using standard searches, so I thought I'd try to emphasize it here so others could find it. (Hopefully it's not so common that *everyone else* knows it!)

At first, I used the following:

target.value = target.attributes.getNamedItem('value').nodeValue;

Then I looked at [Flanagan's](https://www.davidflanagan.com/) [*Javascript: The Definitive Guide*](https://www.amazon.com/gp/product/0596101996?ie=UTF8&tag=davidflanagancom&link_code=as3&camp=211189&creative=373489&creativeASIN=0596101996) (using his amazon associates link), where he states that IE implementation of the attributes array,"makes it impossible to use this feature portably." He doesn't mention which version of IE (this specific line of code worked in IE6, IE7, and IE8a), but I figured I'd go with the more general version.

If you read this, I hope I could save you a bit of time.

P.S. -- I used IE8a's Debugger to help. Here's hoping they develop it further before the standard release. It's MUCH better than flying blind, but I can't imagine a less helpful message than specifying an object in the console, and seeing "{...}".