---
title: 'High Performance CSS code design'
date: '2011-04-06T00:44:25-05:00'
status: publish
permalink: /2011/04/06/high-performance-css-code-design
author: Eddie
excerpt: ''
type: post
id: 330
category:
    - css
    - programming
    - 'web design'
tag:
    - css
    - oocss
    - programming
    - refactoring
post_format: []
---
In the last few years much emphasis has been placed on web performance issues. Browser vendors have optimized JavaScript engines, JavaScript libraries have been honed, and content delivery has been improved. Unfortunately, CSS has received less attention. Developers have been advised how to optimally transfer CSS files, and instructed to use CSS shorthand, but very little has targeted CSS code itself.

[Ms. Nicole Sullivan](http://www.stubbornella.org/) is among those looking to improve CSS code. She has been promoting "[OOCSS](https://github.com/stubbornella/oocss)," or "[Object Oriented CSS](https://github.com/stubbornella/oocss)," her methodology for how to design and refactor CSS<sup>[1](#n1)</sup>. She has collected a number of best practices for architecting a CSS framework. The benefits are simple: CSS will perform better, become more modular, as well as being grounded with a consistent API, making it easier to learn and use. This is accomplished by reducing the file size and complexity of our CSS.

While many of these techniques can be considered common practice for experienced CSS programmers, implementing them can be difficult. The art is in analyzing trade-offs and picking the optimal path. That said, these rules are not for everyone, or every site. It all boils down to deciding if the site’s performance gain is greater than the time it takes to learn and use the techniques.

### Useful for sites with

- Many pages
- A common visual and structural design
- Critical performance requirements

### Less useful for sites with

- A few pages or just one page
- Varying design (possibly "portfolio" or design sites)
- Few performance concerns

So how do we get started? We go hunting for bad code smells. In Chapter 3 of [*Refactoring: Improving the Design of Existing Code*](http://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0201485672), [Martin Fowler](http://martinfowler.com/) and [Kent Beck](http://twitter.com/kentbeck) coin the phrase "code smell," meaning "structures in the code that suggest the possibility of refactoring." Simply put, we go looking for chunks of code that our intuition tells us could be cleaned. In the chapter heading, Grandma Beck is quoted (then talking about child-rearing), "If it stinks, change it." We’ll take a more formal approach to finding these code smells, going from easy to difficult. First, we’ll sniff around the CSS selectors, and then move onto the CSS properties. Finally we’ll look for visual design patterns that can direct the structure of our CSS.

Selectors
---------

Selectors are both the easiest place to find code smells in CSS and the easiest to correct. Three big code smells tend to stink up CSS selectors; unused selectors, location-based selectors, and overly specific selectors. Each contributes significantly to increased CSS file size.

### Unused Selectors

Code that does nothing is obviously wasteful, and is the first candidate for removal. Tools like dust me selectors that can spider a site can identify all of the unused or orphaned styles that your stylesheets still contain.

### Location-based Selectors

Location-based selectors prohibit code reuse because they are intended to isolate styles for a specific part of the page, yet frequently used HTML components are often reused in a different context. Therefore, its counterproductive to hard-code that initial context into a selector.

Location-based selectors are easy to spot. The pattern is a long list of selectors that starts with the same initial selector, as follows (assuming the source is reasonably ordered).

`.sidebar {â€¦}
.sidebar .nav {â€¦}
.sidebar .nav .box {â€¦}
.sidebar .nav .box .header {â€¦}
.sidebar .nav .box .body p {â€¦}`

Because each selector chain starts with a location-based selector, none of them are reusable. What if we add a new group of pages that use the same .box structure but need to be placed in the content, header, or footer? A novice would add more comma separated selector chains, but that amounts to copying code.  
`
.sidebar .nav .box, .content .nav .box, .header .nav .box, .footer .nav .box {â€¦}`

The correct approach is to factor out the common functionality while ditching the location-based rules. Now the styles can be reused regardless of the box location.

`.box {â€¦}
.box .header {â€¦}
.box .footer {â€¦}`

Why not break the .box and .header/.footer chains apart? Here the .box class encapsulates the .header and .footer behaviors, hiding these names from the global scope and allowing the "header" and "footer" classnames to be used elsewhere.

To those looking ahead to HTML5, you should already recognize how this pattern can be applied to section elements containing header and footer elements.

### Varying specificity

By 2010, everyone should be aware that adding "style" attributes directly to HTML elements is a bad idea (and code smell). What about everything else?

Selectors that contain properties set as `!important` should be avoided because their specificity makes them difficult to override.

Browser selector hacks like `* html {â€¦}` should be avoided because they tend to require redefinition of both the problem properties and all other properties, leading to duplicate code. When hacks are needed, use property hacks like the star (IE7 and less) and underscore (IE6 and less) instead.

Because IDs can be used only once per-page, selectors containing IDs can typically only be used in a specific place on each page. IDs are great when you need to grab something from the DOM in JavaScript, but avoid them in your CSS.

Element selectors should be used to provide element defaults, especially when redefining styles previously zeroed out by a reset stylesheet. Using them for anything but defaults tends to yield repetitive CSS.

Keeping selector specificity as similar as possible makes it easy to use classes that only define differences.

HTML:

``

<div>Default (black) box</div>``

<div>Green box</div><div> Red box</div>CSS:

`.box { padding:1em; color:black; border: 1px solid black; }`

` `

`/* simple selectors because the specificity is equal to the base ".box" object's selector */
.green_border { border: 2px solid green; }
.red_border { border: 2px solid red; }`

Properties
----------

Properties appear in CSS more frequently than selectors, and as a result their quantity masks their code smells a bit. However we can exploit their frequency to find repetitive code<sup>[2](#n2)</sup>.

### Margin: 0 and padding: 0

Resetting the margin and padding properties to zero is extremely common. Using a reset stylesheet will help you do this everywhere in one place. A reset will zero all margin and padding properties, leaving only the non-zero values left to set. If you find that your CSS contains more instances setting the margin or padding to another value (for example, 1em), you can edit your reset or add a global rule setting this alternate default.

Before:

(my.css)

`.portlet {margin:0; padding:0; â€¦ }
.header {margin:0; padding:0; â€¦ }
.footer {margin:0; padding:0; â€¦}
`

After:

(Reset.css)

`div {margin:0; padding:0}`

(my.css)

`.portlet { â€¦ }
.header { â€¦ }
.footer { â€¦ }`

### Float

Overuse of the float property is a code smell indicating repetition in placing items on a page. Use of a grid structure will reduce duplication caused by object placement. Rather than have each element float itself, a grid structure will do this all one time only.

### Font-size

It’s rare for sites to use multiple sizes of body text on one page, or site wide. Therefore most font-size properties are likely used to define header-like text sizes. [Ms. Sullivan does an excellent job pointing out](http://www.stubbornella.org/content/2010/07/01/top-5-mistakes-of-massive-css/), that of a finite number of font-sizes that can be used on a page, there are even fewer that a user can differentiate (for example the difference between 15px and 16px browser font sizes). Font-size therefore is usually a code smell for repeating headers.

### Mingling box model, visual formatting model, and presentational properties

The CSS specification groups similar properties into sections. The Box model is the most famous (because it had previously been the most infamous). Everyone is familiar with its margins, paddings, and borders building on widths and heights. The Visual formatting model uses the display, position, float, clear, and z-index properties to dictate the layout of the boxes in the document. The CSS specification makes no mention of "presentational properties," but that’s a term I use to include color, background, font, and text properties that style the boxes or their contents.

Separating selectors along these lines allows for greater code reuse. The box model properties are the most easily re-used of the three. It is not uncommon for a number of boxes on the page to share the same properties, so moving these properties into a new class will allow you to apply these styles in a consistent and efficient manner. The visual formatting properties are typically less likely to be reused, therefore separating them from the boxes will allow greater reuse of both the visual formatting and box properties.

It must be noted, however, that there will be cases where the same box model properties will often be paired with the same visual formatting properties. In that case it is perfectly acceptable to leave them coupled together.

Presentational properties are the least likely set to be reused. This isn’t surprising because they are typically dependent on the contents of the boxes. That makes these the most logical candidate for extraction, because doing so will increase the usability of the remaining properties.

Keep in mind we are still trying to build a consistent API for others to use. Creating new patterns of box model, visual formatting model, and presentational property oriented classes will give future developers a wide range of flexibility to mix-and-match these classes while styling new elements.

Visual design patterns
----------------------

In the last section, we looked at the effects of mingling box model, visual formatting model, and presentational properties. Searching for visual design patterns is the next logical step, albeit a complicated one.

This technique is tricky. Unlike the others, this has the additional restriction in that it is usually only suitable for finished designs. Attempting this on an in-development design may send you on the road toward madness. Additionally, it doesn’t lend itself very well to searching code. In effect we are looking for repeating groups of CSS propertiesâ€¦ but these properties can typically span multiple selectors! So instead of looking to the code for patterns, we look for patterns in the other direction, at the visual output.

This technique also takes the longest, since it requires looking at all of the pages on a site as a whole.

### Headers

Finding headers on the page should be fairly simple, and to be honest, you’ve probably taken care of this searching for repeated font-size properties as described above. However a visual inventory may convince you that your headers are more alike than different, and you may find an opportunity to tighten the differences. You may even decide to dump one of the variationsâ€"even better.

### Portlets

In a portal or information dashboard oriented design, each chunk of output, whether contained in a box/window type structure, or structure-less (think Apple’s Dashboard) is bound to share common characteristics. In the structure-less design you can focus on extracting the visual formatting properties into reusable classes defining position. Box or window contained portlets can be constructed using a combination of box model, and presentational properties. And if you’re using a dashboard design, these chunks of output can probably be arranged using a grid structure.

### Grids

Alignment is the key to identifying patterns where grids can be applied. Take five steps back from your monitor and look at the top-level page objects. If some of these objects are loosely aligned, they can probably be included into a grid. Sketch the grid and the objects within on a piece of paper. Now walk three steps forward, and look at the each individual section in your wireframe. If you identify objects aligned in your sections, you may be primed for using a nested grid. Sketch that grid (have you realized that you’re wireframing yet?). Keep going until you’ve exhausted all of the sections you’ve drawn (have you realized you’re using recursion yet?)

Then start the tedious process of tearing out the previous code and replacing with a grid structure.. The end product will be far more efficient and easier to maintain. (Which grid should you use? Which every you choose! As long as you are using one your code will be cleaner and more efficient.)

### "Media Blocks"

One pattern that Ms. Sullivan found frequently on the Facebook site is something she has coined a "Media Block," which [she defines](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/) as "an image to the left, with descriptive content to the right." Simply put, this is just a compound object, which is slightly more abstract than the previous examples. She analyzes these media blocks in two steps. First define their constant functional properties (what they do), then identify the variables in the design (parts could fluctuate in certain conditions).

Not all sites will contain objects like these, but if yours does, identifying the patterns will help to reduce code duplication and promote code reuse.

### More

This short list couldn’t hope to represent the entirety of the visual design patterns that can be found on a website. That’s why a site inventory is required. If you find similar patterns repeating multiple times, this is a chance for you to optimize.

Results
-------

Once these rules have been applied, your file size should be smaller, so less information has to be downloaded, making the page load faster. The overall complexity of your CSS rules should also be reduced, meaning the browser will have less redundant rules to apply, and your page should load faster. And finally, you will have defined an API for common CSS across your site, making it easier for developers to create new pages.

- - - - - -

Footnotes
---------

<sup><a id="n1">1</a></sup> Personally, I find the choice of the "OOCSS" or "Object Oriented CSS" name both poor and misleading. To call something "Object Oriented" when the metaphor doesn’t fit (CSS has no data per se, and it certainly has no methods) is confusing, especially when the audience is likely to be familiar with the term. To then give your CSS library the same name and overload the term twice obscures a very useful set of CSS refactoring methods.

<sup><a id="n2">2</a></sup> This can be accomplished with the Unix tool grep, a powerful text searching utility. It is also possible to accomplish this through your editor, as long as it supports searching multiple files at once. It is especially useful to be able to count occurrences across files.