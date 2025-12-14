---
title: 'Advantages of push-style XSLT over pull-style'
date: '2008-11-25T00:56:24-05:00'
status: publish
permalink: /2008/11/25/push-style-xslt-vs-pull-style
author: Eddie
excerpt: ''
type: post
id: 155
categories:
    - programming
    - xslt
tags:
    - functional
    - pull
    - push
    - scheme
    - style
    - templates
    - xslt
post_format: []
---
Working with more than a few new-hires over the last few weeks, I've noticed that new XSLT developers often write pull-style XSLTs by default. However, this tends to defy XSLT's functional heritage, and is not as useful as the opposite form, push-style XSLTs.

Pull-style XSLTs reach into the source document and pull out the data they need to transform. The pull-style is similar to template systems like those found in Rails or Django, or inserting PHP commands between HTML elements. For example, given the trivial input:

```
<?xml version="1.0" encoding="UTF-8"?>
<books>
    <book>
        <title>The Scheme Programming Language</title>
        <author>R. Kent Dybvig</author>
    </book>
    <book>
        <title>Essentials of Programming Languages</title>
        <author>Daniel P. Friedman</author>
    </book>
    <book>
        <title>An Introduction to Information Theory</title>
        <author>John R. Pierce</author>
    </book>
</books>
```

an XSLT novice will produce a stylesheet like the following (note lines 11 and 12 which reach into the source and grab the data):

```
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:template match="/">
        <html>
            <head>
                <title>books</title>
            </head>
            <body>
                <dl>
                    <xsl:for-each select="books/book">
                        <dt><xsl:value-of select="title"/></dt>
                        <dd><xsl:value-of select="author"/></dd>
                    </xsl:for-each>
                </dl>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
```

which transforms into:

```
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>books</title>
   </head>
   <body>
      <dl>
         <dt>The Scheme Programming Language</dt>
         <dd>R. Kent Dybvig</dd>
         <dt>Essentials of Programming Languages</dt>
         <dd>Daniel P. Friedman</dd>
         <dt>An Introduction to Information Theory</dt>
         <dd>John R. Pierce</dd>
      </dl>
   </body>
</html>
```

The real power of XSLT, however, is defining templates for the elements found within the source document. These are push-style XSLTs. They have two main advantages. First, push-style gracefully handles complex source structures, including recursively nested elements. It would be near impossible to handle the following source document using pull-style,

```
<pre lang="xml">
<div><div><div>a</div></div></div>
```

if you didn't know how deep the recursive divs would go. A push-style solution, though, is incredibly simple.

```
<pre lang="xml">
<template match="div">
     * <apply-templates></apply-templates> *
</template>
```

Will transform the previous source into the following.

```
* * * a * * *
```

In addition to handling complex source structures, push-style allows code reuse. This is of course an ideal of any programming language. Push-style XSLTs have a greater ability to be reused, because the individual templates can be reused. When you only have one template, it is quite difficult to make it general without resorting to numerous choose-when statements. Here is an example of code reuse, where we extend a previously written template with the xsl:apply-imports rule.

Given the input,

```
<images>
    <image>
        <url>http://www.filmjunkie.com/drinks/blixa/blixa.jpg</url>
        <alt>Blixa!</alt>
    </image>
</images>
```

and the XSLTs,

```
    <xsl:import href="imageformat.xsl"/>
 
    <xsl:template match="image">
        <div class="wrapper">
            <xsl:apply-imports/>
        </div>
    </xsl:template>
```

and the rule in "imageformat.xsl" (the template being extended in this case),

```
    <xsl:template match="image">
        <img src="{url}" alt="{alt_text}"/>
    </xsl:template>
```

the processor will apply the higher-precedence template first, and then apply the imported (and lower-precedence) template to yield the following output.

```
<div class="wrapper">
    <img src="http://www.filmjunkie.com/drinks/blixa/blixa.jpg" alt="Blixa!"/>
<div>
```

Push-style XSLTs are not the most obvious thing to pick up unless you've been exposed to a functional programming language like Lisp or Scheme. However, considering their great value, they should be among the first disciplines studied when learning XSLT.