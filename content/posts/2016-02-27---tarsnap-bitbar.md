---
title: BitBar, Tarsnap, and Ruby
comments: true
description: "BitBar support for automated Tarsnap backups with Ruby."
date: "2016-02-27"
template: "post"
draft: false
slug: "tarsnap-bitbar"
category: "Open Source"
tags:
  - "Code"
  - "Customize"
  - "macOS"
  - "Ruby"
---

I came across a really cool OSX menu bar library and thought it would be a really good solution to show my Tarsnap backup statuses.

[https://github.com/matryer/bitbar](https://github.com/matryer/bitbar)

I love how easy it is to write a plugin for BitBar in Ruby.

It's as simple as:

```ruby
#!/usr/bin/ruby
puts "Cool Menubar"
puts "---"
puts "The time is: #{Time.now.strftime('%T')}"
```

Anyway, I updated my git repo to include a BitBar plugin and also updated the main backup script to output a nice JSON file for it to read: [https://github.com/aaronvb/tarsnap_backup](https://github.com/aaronvb/tarsnap_backup)


And here's a screenshot of it in use:

[![bitbar_ss.png](/media/bitbar_ss.png)](/media/bitbar_ss.png)
