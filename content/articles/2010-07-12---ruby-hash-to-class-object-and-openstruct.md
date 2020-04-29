---
title: Ruby Hash to Class Object and OpenStruct
slug: "ruby-hash-to-class-object-and-openstruct"
comments: true
date: "2010-07-12"
template: "post"
draft: false
category: "Tutorial"
tags:
  - "Code"
  - "Ruby"
---
I've been working on a class that's pulling information from an API and wanted to create dynamic attributes from a hash(json).

I came across this link:

[pullmonkey.com/2008/01/06/convert-a-ruby-hash-into-a-class-object](http://pullmonkey.com/2008/01/06/convert-a-ruby-hash-into-a-class-object)

It works pretty well, but I haven't done much benchmarking. I've read in the past that define_method can be slow and has memory leaks.

Following that post, I read the comments and came across OpenStruct:

[ruby-doc.org/stdlib-2.5.1/libdoc/ostruct/rdoc/OpenStruct.html](https://ruby-doc.org/stdlib-2.5.1/libdoc/ostruct/rdoc/OpenStruct.html)

I have it working with what I need but there's still more testing to be done. Just thought I would share.