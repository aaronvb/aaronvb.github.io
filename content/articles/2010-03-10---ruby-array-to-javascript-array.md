---
title: Ruby Array to Javascript Array
description: "Here's a little gem I found a while ago that I'm reusing in my current project."
slug: "ruby-array-to-javascript-array"
comments: true
date: "2010-03-10"
template: "post"
draft: false
category: "Tutorial"
tags:
  - "Code"
  - "Ruby"
---
Need to pass a Ruby Array to a Javascript Array?
Here's a little gem I found a while ago that I'm reusing in my current project.

```ruby
>> a_ruby_array = ["one", "two", "three"]
=> ["one", "two", "three"]
>> "['#{a_ruby_array.join('\',\'')}']"
=> "['one','two','three']"
```