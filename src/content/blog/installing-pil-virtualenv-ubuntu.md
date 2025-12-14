---
title: 'Installing PIL inside virtualenv for Ubuntu 9.10'
date: '2010-03-31T20:50:42-05:00'
slug: 2010/03/31/installing-pil-virtualenv-ubuntu
    - django
    - python
tags: []
---
I just removed a (real live) bat from my living room. That was easier than installing PIL in a virtualenv for Ubuntu 9.10. Why? Googling the subject seems to bring up a lot of old or mis-information. This will explain how... mostly so I can do it again next time.

I started with a --no-site-packages virtualenv, so as not to use (or more importantly depend) on any of the global site-packages. Ok, cool.

`$ virtualenv --no-site-packages myEnv`

First, I needed to install the python developer tools. (Use apt-get or aptitude, whatever floats your boat)

`$ sudo aptitude install python-dev`

Then, I needed to install libjpeg and libjpeg-dev. I'm not sure why, but I needed libjpeg simply doesn't exist, so I needed to install libjpeg62. I can't pretend that I know the difference (or if there is one). In fact, I may have gotten away with installing libjpeg62 and libjpeg-dev (rather than both "62" versions... libjpeg62 and libjpeg62-dev), but only further testing will tell.

Why? If you install PIL without this library, you'll get those wonderful "decoder jpeg not available" messages in Python. Or worse yet, if you're trying to use it in a Django, you may get some errors (specifically the "Upload a valid image. The file you uploaded was either not an image or a corrupted image" warning), or you may not get any until you open the shell. Either way, you can test with the method listed below. If you get the "decoder jpeg not available" message, your install didn't work.

The zlib package handles PNGs.

`$ sudo aptitude install libjpeg62 libjpeg62-dev
$ sudo aptitude install zlib1g-dev
$ sudo aptitude install libfreetype6 libfreetype6-dev`

Alright, now we seem to be done with the prerequisites. Start your virtualenv (of course, myEnv in the example is the name of your virtualenv).

`$ source myEnv/bin/activate`

Download PIL and install. This will make sure to install PIL within your virtualenv's site-packages.

`(myEnv)$ wget http://effbot.org/downloads/Imaging-1.1.7.tar.gz
(myEnv)$ tar zxvf Imaging-1.1.7.tar.gz
(myEnv)$ cd Imaging-1.1.7
(myEnv)$ python setup.py install`

If you run into further problems (the "decoder jpeg not available" message again), you may have to resort to the [long directions](http://effbot.org/zone/pil-decoder-jpeg-not-available.htm) to get PIL and libjpeg to play happily together, but I hope not.

Now that you have everything installed, test it. Open up a python shell from within your virtualenv.

`(myEnv)$ python`

Now try the following (with an image in your home directory) to see if everything is running smoothly.

`>>> from PIL import Image
>>> i = Image.open('/home/username/someJpeg.jpg')
>>> i.save('/home/username/someOtherJpeg.jpg')`

If all of that works, you should now be ready to work.

Note: I would love to install the jpeg, freetype and zlib packages locally as well, but that was a step beyond what I was willing to mess with. Maybe for a future set of instructions.

\*\*\*\*

UPDATE:

In Ubuntu 11, it seems that you need libjpeg8-dev, rather than libjpeg62.