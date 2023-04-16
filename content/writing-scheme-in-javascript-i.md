---
title: 'Writing Scheme in Javascript I'
date: '2008-02-10T13:04:16-05:00'
status: publish
permalink: /2008/02/10/writing-scheme-in-javascript-i
author: Eddie
excerpt: ''
type: post
id: 71
category:
    - javascript
tag:
    - 'global scope'
    - 'kent dybvig'
    - scheme
    - 'scheme programming language'
    - 'the scheme programming language'
post_format: []
---
This is an interesting little function that I ran across in Kent Dybvig’s *[The Scheme Programming Language](http://www.scheme.com/tspl3/start.html#./start:h9).* I thought I would give it a go in javascript. I wrote it out, and ran into two problems. First, I wasn’t returning anything from the anonymous-self-executing function, so it was being garbage collected, and the call to tell() would give an undefined (secret didn’t exist anymore). The second was that I initially declared secret without the *var* which gave it global scope. Took me a little while to figure these out, but since I haven’t looked at any javascript in months, I don’t feel so bad.  
``

```


/* the original function from The Scheme Programming Language
(define shhh #f)
(define tell #f)

(let ((secret 0))
  (set! shhh
    (lambda (message)
      (set! secret message)))
  (set! tell
    (lambda ()
      secret)))
```

```

(shhh "sally likes harry")
(tell) <graphic> "sally likes harry"
secret <graphic> Error: variable secret is not bound
*/
</graphic></graphic>
```

```
<graphic><graphic>//the Javascript version of the same function
</graphic></graphic>
```

```
<graphic><graphic>var shhh = false;
var tell = (function(){
 var secret = 0;
 shhh = function(message) { secret = message; }
 return function() { console.info(secret); }
})();

shhh("harry likes sally");
console.info("tell: " + tell() );</graphic></graphic>
```