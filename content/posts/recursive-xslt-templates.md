---
title: 'My XSLT Toolbox – Recursive XSLT templates'
date: '2008-12-28T17:21:35-05:00'
status: publish
permalink: /2008/12/28/recursive-xslt-templates
author: Eddie
excerpt: ''
type: post
id: 199
categories:
    - programming
    - xslt
tags:
    - exslt
    - recursive
    - templates
    - tokenize
    - xpath
    - xslt
post_format: []
---
Recursion is one of the core concepts in programming. It's valuable not only as a technique for writing programs, but as a general concept for solving problems. XSLT provides many useful elements such as for-each (and apply-templates), but occasionally you will run into a problem which must be solved with recursion. Let's take a look at a real-world (no Fibonacci!!) example, where we have to operate on a simple string of numbers separated by commas. We'll take a step-by-step approach to writing a recursive template.

Let's say we have the following source document, short and sweet. We want to take each number, and wrap it with an element.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<comma>1,2,3,4,5,6,7,88,99,100</comma>
```

The easy way to do this is to use the [EXSLT str:tokenize function](http://www.exslt.org/str/functions/tokenize/), which takes a string and some delimiters and splits the string based on those delimiters. All we do is add the xmlns:str and extension-element-prefixes attributes to our xsl:stylesheet declaration, and then call the str:tokenize function.

```xml
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  version="1.0" xmlns:str="http://exslt.org/strings"
  extension-element-prefixes="str">
  <xsl:template match="/>
  <xsl:for-each select="str:tokenize( comma, ',')">
    <xsl:copy-of select="."/>
  </xsl:for-each>
</xsl:template>
</xsl:stylesheet>
```

The result is, (new-lines added for readability):

```xml
<?xml version="1.0"?>
<token>1</token>
<token>2</token>
<token>3</token>
<token>4</token>
<token>5</token>
<token>6</token>
<token>7</token>
<token>88</token>
<token>99</token>
<token>100</token>
```

Excellent. But let's say that we don't have access to the EXSLT functions, and we have to write a template to perform the same thing.

So now we think up a recursive algorithm. Let's look at a simplified list with three numbers, such as "1,2,3". First, we print the "1", the value before the first comma, and then we discard the first comma. At that point, our list will be "2,3" and we repeat, printing the new first value, and discarding the new first comma. Finally, the list becomes only "3". There is no comma, so we simply print out the rest of the list, "3". So we will be recursing over the string printing the first number, and then popping off the first number and first comma. This technique will work with a three number list, or a million-number list (though your processor will probably run out of memory before that).

XPath's "substring-before", "substring-after", and "contains" functions are all of the tools that we'll need to implement our algorithm. "substring-before" lets us obtain the number before the first comma. "substring-after" lets us discard the first number and first comma, and "contains" allows us figure out the last, comma-less case.

Our function starts in the same manner as all recursive functions, dealing with the last case, and then all of the cases before it. The last case will be the comma-less case from our algorithm. So here's our template skeleton.

```xml
<xsl:template name="splitcommas">
  <xsl:choose>
    <xsl:when test=" not(contains($comma, ','))">
      <!-- do something -->
      </xsl:when>
      <xsl:otherwise>
        <!-- do something -->
        </xsl:otherwise>
      </xsl:choose>
    </xsl:template>
```

We use the XPath "not(contains($comma, ','))" to, obviously, test whether our list contains a comma. As you probably noticed, we don't actually have a $comma variable defined, so we'll add our xsl:param to the template.

```xml
<xsl:template name="splitcommas">
  <xsl:param name="comma"/>
  <xsl:choose>
    <xsl:when test=" not(contains($comma, ','))">
      <!-- do something -->
      </xsl:when>
      <xsl:otherwise>
        <!-- do something -->
        </xsl:otherwise>
      </xsl:choose>
    </xsl:template>
```

Now we fill in the holes in the template's framework. First, we'll handle the comma-less case, simply outputting the value wrapped in a "value" element.

```xml
<value>
  <xsl:value-of select="$comma"/>
</value>
```

Then we will deal with the otherwise case. We'll first print out the number before the first comma in the same manner that we printed the comma-less case.

```xml
<value>
  <xsl:value-of select="substring-before($comma, ',')"/>
</value>
```

Then we'll perform the same operation on the list after discarding the first number and first comma. We'll call the template again, passing everything after the first comma (thus excluding both the first number and the first comma).

```xml
<xsl:call-template name="splitcommas">
  <xsl:with-param name="comma" select="substring-after($comma, ',')"/>
</xsl:call-template>
```

Finally, we'll put all of these parts together, as well as adding a root template that will call our "splitcommas" template.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <xsl:call-template name="splitcommas">
      <xsl:with-param name="comma" select="comma"/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template name="splitcommas">
    <xsl:param name="comma"/>
    <xsl:choose>
      <xsl:when test=" not(contains($comma, ','))">
        <value>
          <xsl:value-of select="$comma"/>
        </value>
      </xsl:when>
      <xsl:otherwise>
        <value>
          <xsl:value-of select="substring-before($comma, ',')"/>
        </value>
        <xsl:call-template name="splitcommas">
          <xsl:with-param name="comma" select="substring-after($comma, ',')"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

When applied to our source document, we get exactly what we wanted, each number of the string, enclosed in a `<value>` element (I added new-lines for readability).

```xml
<?xml version="1.0"?>
<value>1</value>
<value>2</value>
<value>3</value>
<value>4</value>
<value>5</value>
<value>6</value>
<value>7</value>
<value>88</value>
<value>99</value>
<value>100</value>
```

So we accomplished what we were looking to accomplish by writing a recursive template, however our template only deals with commas. What if our list was separated by spaces instead of commas? We'd have to either write a new template that deals with spaces, or, better yet, modify our template to be more generic and handle many cases. I invite you to take a look at the [actual implementation of the str:tokenize function](http://www.exslt.org/str/functions/tokenize/str.tokenize.template.xsl). It isn't that much more complicated, but does contain a few interesting wrinkles.

If you're interested in the basics of recursion in general, I highly recommend [*The Little Schemer*](http://www.amazon.com/gp/product/0262560992?ie=UTF8&tag=eddwelsblo-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=0262560992) which is the most outstanding book I've read on the subject.