---
title: KWM & Ubersicht Bottom Bar
description: "A simple bottom bar widget for OS X and Ubersicht."
slug: "ubersicht-bottombar"
comments: true
date: "2016-03-30"
template: "post"
draft: false
category: "Open Source"
tags:
  - "Code"
  - "Customize"
  - "macOS"
  - "CoffeeScript"
---

I recently made the switch to a tiling window manager in OS X. After watching my  friend use i3 on his Linux machine, OS X started to feel outdated to me, ironically. OS X really lacks a solid window management experience. I've messed around with the built in Spaces, but would revert back to one space, and run every app at max size, relying on cmd+tab to move around.

[Spectacle](https://github.com/eczarny/spectacle) became my pseudo tiling manager for a short while, mainly for split screen work(which I became very fond of). But Spectacle, for me, wasn't enough. It provided easy to use hotkeys for controlling window sizes, but I wanted it to be automated. I also wanted to control padding around windows, because I like padding!

The same friend who showed me i3 suggested I try [KWM](https://github.com/koekeishiya/kwm), a real tiling manager built for OS X. It took me a bit to get used to the mouse focus control, and KWM can sometimes do weird things, but overall I'm pretty satisfied with it.

Before my switch to KWM, I was using iStat Menus for system information and with the menu bar hidden, it became useless to run. The KWM repo shows an example of  nice menu bar replacement, with system information, and I thought that would be nicer if it was at the bottom, like i3. I used that as a starting point, added network traffic and weather data, and ended up with this:

[https://github.com/aaronvb/ubersicht-bottombar](https://github.com/aaronvb/ubersicht-bottombar)

You'll need to download [Übersicht](http://tracesof.net/uebersicht/), which is the widget app this uses.

Here's a screenshot of it in use:

[![ubersicht3.png](../assets/ubersicht3.png)](../assets/ubersicht3.png)
