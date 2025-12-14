---
title: 'My XSLT Toolbox – copy and copy-of'
date: '2008-12-27T16:05:09-05:00'
status: publish
permalink: /2008/12/27/xslt-copy-copy-of
author: Eddie
excerpt: ''
type: post
id: 184
categories:
    - programming
    - xslt
tags:
    - copy
    - copy-of
    - tutorial
    - xslt
post_format: []
<?xml version="1.0" encoding="UTF-8"?>\n<inventory>\n    <item id="1">\n        <name>The Little Schemer</name>\n        <type>book</type>\n        <author>Friedman</author>\n        <author>Felleisen</author>\n        <list-price>29.95</list-price>\n        <sell-price>26.99</sell-price>\n        <cost>17.92</cost>\n    </item>\n    <item id="2">\n        <name>XSLT</name>\n        <type>book</type>\n        <author>Tidwell</author>\n        <list-price>49.95</list-price>\n        <sell-price>34.99</sell-price>\n        <cost>22.92</cost>\n    </item>\n    <item id="3">\n        <name>Romeo and Juliet</name>\n        <type>compact disc</type>\n        <conductor>Rostropovich</conductor>\n        <list-price>18.98</list-price>\n        <sell-price>13.99</sell-price>\n        <cost>9.92</cost>\n    </item>\n</inventory>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?>\r\n<inventory>\r\n    <item id=&quot;1&quot;>\r\n        <name>The Little Schemer</name>\r\n        <type>book</type>\r\n        <author>Friedman</author>\r\n        <author>Felleisen</author>\r\n        <list-price>29.95</list-price>\r\n        <sell-price>26.99</sell-price>\r\n        <cost>17.92</cost>\r\n    </item>\r\n    <item id=&quot;2&quot;>\r\n        <name>XSLT</name>\r\n        <type>book</type>\r\n        <author>Tidwell</author>\r\n        <list-price>49.95</list-price>\r\n        <sell-price>34.99</sell-price>\r\n        <cost>22.92</cost>\r\n    </item>\r\n    <item id=&quot;3&quot;>\r\n        <name>Romeo and Juliet</name>\r\n        <type>compact disc</type>\r\n        <conductor>Rostropovich</conductor>\r\n        <list-price>18.98</list-price>\r\n        <sell-price>13.99</sell-price>\r\n        <cost>9.92</cost>\r\n    </item>\r\n</inventory></p></div>\n\";i:2;s:2250:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<?xml version="1.0" encoding="UTF-8"?>\n<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">\n&nbsp;\n    <xsl:template match="/">\n        <xsl:copy-of select="inventory/item[name = 'XSLT']"/>\n    </xsl:template>\n&nbsp;\n</xsl:stylesheet>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?>\r\n<xsl:stylesheet xmlns:xsl=&quot;http://www.w3.org/1999/XSL/Transform&quot; version=&quot;1.0&quot;>\r\n\r\n    <xsl:template match=&quot;/&quot;>\r\n        <xsl:copy-of select=&quot;inventory/item[name = 'XSLT']&quot;/>\r\n    </xsl:template>\r\n\r\n</xsl:stylesheet></p></div>\n\";i:3;s:3360:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<?xml version="1.0" encoding="utf-8"?>\n<item id="2">\n    <name>XSLT</name>\n    <type>book</type>\n    <author>Tidwell</author>\n    <list-price>49.95</list-price>\n    <sell-price>34.99</sell-price>\n    <cost>22.92</cost>\n</item>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot;?>\r\n<item id=&quot;2&quot;>\r\n    <name>XSLT</name>\r\n    <type>book</type>\r\n    <author>Tidwell</author>\r\n    <list-price>49.95</list-price>\r\n    <sell-price>34.99</sell-price>\r\n    <cost>22.92</cost>\r\n</item></p></div>\n\";i:4;s:2404:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<!-- @* matches any attribute node on the current element,\n       node() matches any child nodes of the current element -->\n<xsl:template match="@*|node()">\n    <!-- shallow copy... \n          only copy the node you're on (be that attribute or child node) -->\n    <xsl:copy>\n        <!-- apply this template to any other attribute or child nodes found -->\n        <xsl:apply-templates select="@*|node()"/>  \n    </xsl:copy>\n</xsl:template>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><!-- @* matches any attribute node on the current element,\r\n       node() matches any child nodes of the current element -->\r\n<xsl:template match=&quot;@*|node()&quot;>\r\n    <!-- shallow copy... \r\n          only copy the node you're on (be that attribute or child node) -->\r\n    <xsl:copy>\r\n        <!-- apply this template to any other attribute or child nodes found -->\r\n        <xsl:apply-templates select=&quot;@*|node()&quot;/>  \r\n    </xsl:copy>\r\n</xsl:template></p></div>\n\";i:5;s:3617:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<?xml version="1.0" encoding="UTF-8"?>\n<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">\n&nbsp;\n    <xsl:template match="/">\n        <xsl:apply-templates/>\n    </xsl:template>\n&nbsp;\n&nbsp;\n    <!-- copy all attribute or child nodes in place -->\n    <xsl:template match="@*|node()">\n        <xsl:copy>\n            <xsl:apply-templates select="@*|node()"/>  \n        </xsl:copy>\n    </xsl:template>\n&nbsp;\n&nbsp;\n</xsl:stylesheet>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?>\r\n<xsl:stylesheet xmlns:xsl=&quot;http://www.w3.org/1999/XSL/Transform&quot; version=&quot;1.0&quot;>\r\n\r\n    <xsl:template match=&quot;/&quot;>\r\n        <xsl:apply-templates/>\r\n    </xsl:template>\r\n    \r\n\r\n    <!-- copy all attribute or child nodes in place -->\r\n    <xsl:template match=&quot;@*|node()&quot;>\r\n        <xsl:copy>\r\n            <xsl:apply-templates select=&quot;@*|node()&quot;/>  \r\n        </xsl:copy>\r\n    </xsl:template>\r\n    \r\n    \r\n</xsl:stylesheet></p></div>\n\";i:6;s:842:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<xsl:template match="author"/>\n<xsl:template match="conductor"/>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><xsl:template match=&quot;author&quot;/>\r\n<xsl:template match=&quot;conductor&quot;/></p></div>\n\";i:7;s:2092:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<xsl:template match="item">\n    <xsl:copy>\n        <xsl:apply-templates select="@*|node()"/>\n        <profit>
  <xsl:value-of select="(sell-price - cost)"/>
</profit>\n    </xsl:copy>\n</xsl:template>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><xsl:template match=&quot;item&quot;>\r\n    <xsl:copy>\r\n        <xsl:apply-templates select=&quot;@*|node()&quot;/>\r\n        <profit><xsl:value-of select=&quot;(sell-price - cost)&quot;/></profit>\r\n    </xsl:copy>\r\n</xsl:template></p></div>\n\";i:8;s:7076:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<?xml version="1.0" encoding="UTF-8"?>\n<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">\n&nbsp;\n    <xsl:template match="/">\n        <xsl:apply-templates/>\n    </xsl:template>\n&nbsp;\n    <!-- for each item, copy the <item> element, and apply-templates\n         to it's attributes and children. Finally, create a <profit> \n         element, the difference between the sell-price and the cost.  -->\n    <xsl:template match="item">\n        <xsl:copy>\n            <xsl:apply-templates select="@*|node()"/>\n            <profit>
<xsl:value-of select="(sell-price - cost)"/>
</profit>\n        </xsl:copy>\n    </xsl:template>\n&nbsp;\n    <!-- don't copy these, when they're found, there is no output -->\n    <xsl:template match="author"/>\n    <xsl:template match="conductor"/>\n&nbsp;\n    <!-- copy all attribute or child nodes in place -->\n    <xsl:template match="@*|node()">\n        <xsl:copy>\n            <xsl:apply-templates select="@*|node()"/>  \n        </xsl:copy>\n    </xsl:template>\n&nbsp;\n&nbsp;\n</xsl:stylesheet>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?>\r\n<xsl:stylesheet xmlns:xsl=&quot;http://www.w3.org/1999/XSL/Transform&quot; version=&quot;1.0&quot;>\r\n\r\n    <xsl:template match=&quot;/&quot;>\r\n        <xsl:apply-templates/>\r\n    </xsl:template>\r\n    \r\n    <!-- for each item, copy the <item> element, and apply-templates\r\n         to it's attributes and children. Finally, create a <profit> \r\n         element, the difference between the sell-price and the cost.  -->\r\n    <xsl:template match=&quot;item&quot;>\r\n        <xsl:copy>\r\n            <xsl:apply-templates select=&quot;@*|node()&quot;/>\r\n            <profit><xsl:value-of select=&quot;(sell-price - cost)&quot;/></profit>\r\n        </xsl:copy>\r\n    </xsl:template>\r\n    \r\n    <!-- don't copy these, when they're found, there is no output -->\r\n    <xsl:template match=&quot;author&quot;/>\r\n    <xsl:template match=&quot;conductor&quot;/>\r\n\r\n    <!-- copy all attribute or child nodes in place -->\r\n    <xsl:template match=&quot;@*|node()&quot;>\r\n        <xsl:copy>\r\n            <xsl:apply-templates select=&quot;@*|node()&quot;/>  \r\n        </xsl:copy>\r\n    </xsl:template>\r\n    \r\n    \r\n</xsl:stylesheet></p></div>\n\";i:9;s:9440:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<?xml version="1.0" encoding="utf-8"?>\n<inventory>\n    <item id="1">\n        <name>The Little Schemer</name>\n        <type>book</type>\n        <list-price>29.95</list-price>\n        <sell-price>26.99</sell-price>\n        <cost>17.92</cost>\n        <profit>9.07</profit>\n    </item>\n    <item id="2">\n        <name>XSLT</name>\n        <type>book</type>\n        <list-price>49.95</list-price>\n        <sell-price>34.99</sell-price>\n        <cost>22.92</cost>\n        <profit>12.07</profit>\n    </item>\n    <item id="3">\n        <name>Romeo and Juliet</name>\n        <type>compact disc</type>\n        <list-price>18.98</list-price>\n        <sell-price>13.99</sell-price>\n        <cost>9.92</cost>\n        <profit>4.07</profit>\n    </item>\n</inventory>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot;?>\r\n<inventory>\r\n    <item id=&quot;1&quot;>\r\n        <name>The Little Schemer</name>\r\n        <type>book</type>\r\n        <list-price>29.95</list-price>\r\n        <sell-price>26.99</sell-price>\r\n        <cost>17.92</cost>\r\n        <profit>9.07</profit>\r\n    </item>\r\n    <item id=&quot;2&quot;>\r\n        <name>XSLT</name>\r\n        <type>book</type>\r\n        <list-price>49.95</list-price>\r\n        <sell-price>34.99</sell-price>\r\n        <cost>22.92</cost>\r\n        <profit>12.07</profit>\r\n    </item>\r\n    <item id=&quot;3&quot;>\r\n        <name>Romeo and Juliet</name>\r\n        <type>compact disc</type>\r\n        <list-price>18.98</list-price>\r\n        <sell-price>13.99</sell-price>\r\n        <cost>9.92</cost>\r\n        <profit>4.07</profit>\r\n    </item>\r\n</inventory></p></div>\n\";i:10;s:4156:\"\n<div class=\"wp_syntax\" style=\"position:relative;\"><table><tr><td class=\"code\"><pre class=\"xml\" style=\"font-family:monospace;\">
<?xml version="1.0" encoding="UTF-8"?>\n<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">\n&nbsp;\n    <xsl:template match="/">\n        <xsl:apply-templates/>\n    </xsl:template>\n&nbsp;\n&nbsp;\n    <!-- don't copy the cost, the customer doesn't need to know! -->\n    <xsl:template match="cost"/>\n&nbsp;\n&nbsp;\n    <!-- copy all attribute or child nodes in place -->\n    <xsl:template match="@*|node()">\n        <xsl:copy>\n            <xsl:apply-templates select="@*|node()"/>  \n        </xsl:copy>\n    </xsl:template>\n&nbsp;\n</xsl:stylesheet>
</pre></td></tr></table><p class=\"theCode\" style=\"display:none;\"><?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?>\r\n<xsl:stylesheet xmlns:xsl=&quot;http://www.w3.org/1999/XSL/Transform&quot; version=&quot;1.0&quot;>\r\n\r\n    <xsl:template match=&quot;/&quot;>\r\n        <xsl:apply-templates/>\r\n    </xsl:template>\r\n    \r\n    \r\n    <!-- don't copy the cost, the customer doesn't need to know! -->\r\n    <xsl:template match=&quot;cost&quot;/>\r\n\r\n\r\n    <!-- copy all attribute or child nodes in place -->\r\n    <xsl:template match=&quot;@*|node()&quot;>\r\n        <xsl:copy>\r\n            <xsl:apply-templates select=&quot;@*|node()&quot;/>  \r\n        </xsl:copy>\r\n    </xsl:template>\r\n    \r\n</xsl:stylesheet></p></div>\n\";}"
---
Using XSLT to copy elements is extremely common when you're transforming a source document of a certain type (XML, HTML, etc.) to the same type. Often, you need an exact copy of an element verbatim, but other times you need to selectively choose certain elements to copy and others to discard. XSLT makes this process quite elegant using it's xsl:copy-of and xsl:copy elements. The following is a setp-by-step tutorial on how these elements are used.

When you need an exact copy of an element and it's children, you use the xsl:copy-of element, which makes an exact copy of the selected element and it's children. Given the following XML data, which represents a (trivial) inventory of a store, let's say you want an exact copy of any items with the name "XSLT".

```
<pre lang="xml">
<?xml version="1.0" encoding="UTF-8"??><inventory><item id="1"><name>The Little Schemer</name><type>book</type><author>Friedman</author><author>Felleisen</author><list-price>29.95</list-price><sell-price>26.99</sell-price><cost>17.92</cost></item><item id="2"><name>XSLT</name><type>book</type><author>Tidwell</author><list-price>49.95</list-price><sell-price>34.99</sell-price><cost>22.92</cost></item><item id="3"><name>Romeo and Juliet</name><type>compact disc</type><conductor>Rostropovich</conductor><list-price>18.98</list-price><sell-price>13.99</sell-price><cost>9.92</cost></item></inventory>
```

You simply apply the following XSLT stylesheet to your source document:

```
<pre lang="xml">
<?xml version="1.0" encoding="UTF-8"??><stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><template match="/"><copy-of select="inventory/item[name = 'XSLT']"></copy-of></template></stylesheet>
```

Which gives you exactly what you were looking for, the "item" with the name "XSLT".

```
<pre lang="xml">
<?xml version="1.0" encoding="utf-8"??><item id="2"><name>XSLT</name><type>book</type><author>Tidwell</author><list-price>49.95</list-price><sell-price>34.99</sell-price><cost>22.92</cost></item>
```

That was easy, so now let's say you want to do a little more with your inventory document. Your boss wants a copy of it to look at the numbers and do some accounting. She doesn't care about the authors or conductors, so she'd like that information left out. Also, she would like an additional piece of information for each item, the amount of profit off each item sold, the difference between the sell-price and the cost.

Because we are adding a piece of information and getting rid of elements that don't affect the accounting, we can't use a xsl:copy-of, because that would output an exact copy of the item element, it's attribute nodes, and it's child nodes. This exact copy is called a *deep copy*, because it not only copies the element, but all of it's children as well. The solution is to use xsl:copy which performs a *shallow copy*, which means it **only** copies the current node, and ignores all children or attribute nodes.

Since xsl:copy only copies one element at a time, you need to explicitly specify that you want to continue copying attribute nodes and child nodes. xsl:apply-templates gives us the leverage to write a template that accomplishes that. The following template starts by matching attribute and children nodes, then copies the node, and recursively applies itself to any attribute or child nodes found in the source tree.

```
<pre lang="xml">

<template match="@*|node()"><copy><apply-templates select="@*|node()"></apply-templates></copy></template>
```

Using this template, I can write a XSLT stylesheet that will copy the entire source document without any changes. This isn't quite what we were looking for, because we wanted to add and remove child elements of item, but this is the first step.

```
<pre lang="xml">
<?xml version="1.0" encoding="UTF-8"??><stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><template match="/"><apply-templates></apply-templates></template><template match="@*|node()"><copy><apply-templates select="@*|node()"></apply-templates></copy></template></stylesheet>
```

So how do we add the profit made from each item and remove the unnecessary information? We use the fact that our xsl:match="@\*|node()" template has a very low priority. Determination of default XSLT priorities are an advanced topic I won't go into right now, but feel free to [explore the topic](http://www.w3.org/TR/xslt#conflict) if [you are interested](http://www.dpawson.co.uk/xsl/sect2/N7654.html#d11689e235). Our template is essentially given a priority of -.5. Templates such as xsl:template match="foo", however, are given a default priority of 0. Because templates matching element names are higher priority, we can easily figure out how to remove the "author" and "conductor" elements, just declare templates without outputs!

```
<pre lang="xml">
<template match="author"></template><template match="conductor"></template>
```

We use the same technique to add an element to our "item" elements. First we use xsl:copy to copy the item node itself. Then we apply-templates to any attribute or children nodes found. When an author or conductor element is found, it will match our explicit rules and produce no output, therefore they will not be copied into our result. Finally, we create a new element named "profit" which will contain the difference between the sell-price and the cost.

```
<pre lang="xml">
<template match="item"><copy><apply-templates select="@*|node()"></apply-templates><profit><value-of select="(sell-price - cost)"></value-of></profit></copy></template>
```

So we arrive at our final XSLT stylesheet, which looks like this:

```
<pre lang="xml">
<?xml version="1.0" encoding="UTF-8"??><stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><template match="/"><apply-templates></apply-templates></template><template match="item"><copy><apply-templates select="@*|node()"></apply-templates><profit><value-of select="(sell-price - cost)"></value-of></profit></copy></template><template match="author"></template><template match="conductor"></template><template match="@*|node()"><copy><apply-templates select="@*|node()"></apply-templates></copy></template></stylesheet>
```

When applied to our source document, we get the result our boss wanted, it excludes any "author" or "composer" elements, and includes a "profit" element.

```
<pre lang="xml">
<?xml version="1.0" encoding="utf-8"??><inventory><item id="1"><name>The Little Schemer</name><type>book</type><list-price>29.95</list-price><sell-price>26.99</sell-price><cost>17.92</cost><profit>9.07</profit></item><item id="2"><name>XSLT</name><type>book</type><list-price>49.95</list-price><sell-price>34.99</sell-price><cost>22.92</cost><profit>12.07</profit></item><item id="3"><name>Romeo and Juliet</name><type>compact disc</type><list-price>18.98</list-price><sell-price>13.99</sell-price><cost>9.92</cost><profit>4.07</profit></item></inventory>
```

Using this technique, we can then easily prepare another XSLT stylesheet to generate an inventory list for the customer, which will exclude the "cost" element, since we don't want them knowing it! All we need is to match all attribute and children nodes and copy them as normal, while providing no output when the XSLT processor encounters a "cost" element.

```
<pre lang="xml">
<?xml version="1.0" encoding="UTF-8"??><stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><template match="/"><apply-templates></apply-templates></template><template match="cost"></template><template match="@*|node()"><copy><apply-templates select="@*|node()"></apply-templates></copy></template></stylesheet>
```

Personally, because I end up transforming XML sources to XML output, I end up using xsl:copy-of and xsl:template match="@\*|node()" all the time. In fact, xsl:template match="@\*|node()" just happens to be the first piece of code in my XSLT toolbox.