---
title: 'Installing PIL inside virtualenv for Ubuntu 9.10'
date: '2010-03-31T20:50:42-05:00'
status: publish
permalink: /2010/03/31/installing-pil-virtualenv-ubuntu
author: Eddie
excerpt: ''
type: post
id: 322
category:
    - django
    - python
tag: []
post_format: []
---
I just removed a (real live) bat from my living room.Â That was easier than installing PIL in a virtualenv for Ubuntu 9.10. Why?Â Googling the subject seems to bring up a lot of old or mis-information.Â This will explain how… mostly so I can do it again next time.

I started with a –no-site-packages virtualenv, so as not to use (or moreÂ importantly depend) on any of the global site-packages.Â Ok, cool.

`$ virtualenv --no-site-packages myEnv`

First, I needed to install the python developer tools. (Use apt-get or aptitude, whatever floats your boat)

`$ sudo aptitude install python-dev`

Then, I needed to install libjpeg and libjpeg-dev.Â I’m not sure why, but I needed libjpeg simply doesn’t exist, so I needed to install libjpeg62.Â I can’t pretend that I know the difference (or if there is one).Â In fact, I may have gotten away with installing libjpeg62 and libjpeg-dev (rather than both "62" versions… libjpeg62 and libjpeg62-dev), but only further testing will tell.

Why? If you install PIL without this library, you’ll get those wonderful "decoder jpeg not available" messages in Python.Â Or worse yet, if you’re trying to use it in a Django, you may get some errors (specifically the "Upload a valid image. The file you uploaded was either not an image or a corrupted image" warning), or you may not get any until you open the shell.Â Either way, you can test with the method listed below.Â If you get the "decoder jpeg not available" message, your install didn’t work.

The zlib package handles PNGs.

`$ sudo aptitude install libjpeg62 libjpeg62-dev<br></br>$ sudo aptitude install zlib1g-dev<br></br>$ sudo aptitude install libfreetype6 libfreetype6-dev`

Alright, now we seem to be done with the prerequisites. Start your virtualenv (of course, myEnv in the example is the name of your virtualenv).

`$ source myEnv/bin/activate`

Download PIL and install.Â This will make sure to install PIL within your virtualenv’s site-packages.

`(myEnv)$ wget http://effbot.org/downloads/Imaging-1.1.7.tar.gz<br></br>(myEnv)$ tar zxvf Imaging-1.1.7.tar.gz<br></br>(myEnv)$ cd Imaging-1.1.7<br></br>(myEnv)$ python setup.py install`

If you run into further problems (the "decoder jpeg not available" message again), you may have to resort to the [long directions](http://effbot.org/zone/pil-decoder-jpeg-not-available.htm) to get PIL and libjpeg to play happily together, but I hope not.

Now that you have everything installed, test it.Â Open up a python shell from within your virtualenv.

`(myEnv)$ python`

Now try the following (with an image in your home directory) to see if everything is running smoothly.

`>>> from PIL import Image<br></br>>>> i = Image.open('/home/username/someJpeg.jpg')<br></br>>>> i.save('/home/username/someOtherJpeg.jpg')`

If all of that works, you should now be ready to work.

Note: I would love to install the jpeg, freetype and zlib packages locally as well, but that was a step beyond what I was willing to mess with.Â Maybe for a future set of instructions.

\*\*\*\*

UPDATE:

In Ubuntu 11, it seems that you need libjpeg8-dev, rather than libjpeg62.