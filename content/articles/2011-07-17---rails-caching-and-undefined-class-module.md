---
title: Rails caching and undefined class/module
description: "If you are using Rails.cache, and you are using it to store objects using Marshal.dump and Marshal.load, which is default, I'm sure you've experienced this error."
slug: "rails-caching-and-undefined-class-module"
comments: true
date: "2011-07-17"
template: "post"
draft: false
category: "Open Source"
legacyArticleId: "37"
tags:
  - "Code"
  - "Ruby on Rails"
---

Note: This doesn't affect anything in production as classes are cached at load, see config/environments/production.rb: config.cache_classes = true

I've run into this annoying little problem every time I start work on implementing caching into my rails projects using the built in Rails.cache in Activerecord. If you are using Rails.cache, and you are using it to store objects using Marshal.dump and Marshal.load, which is default, I'm sure you've experienced this error. I'm also pretty sure you've googled it and were a little confused as to why it keeps happening.

You write an object to the Rails.cache, Rails.cache.write("post_#{@post.id}", @post), and then read the object, Rails.cache.read("post_#{@post.id}"), you get the object. Now this time you write the object to cache, restart your rails app, and try to read the object, but now you've received an error, ArgumentError: undefined class/module YOUR_MODEL. This is because rails is trying to Marshal the object, or model in this case, but rails hasn't loaded the model yet!

Go ahead, test it:

```ruby
$ rails c
> @kitten = Kitten.first
> Rails.cache.write("kitten_#{@kitten.id}", @kitten)
=> "OK"
> Rails.cache.read("kitten_1")
=> #<Kitten id: 1, cute: "no">
> exit

$ rails c
> Rails.cache.read("kitten_1")
=> ArgumentError: undefined class/module Kitten
> Kitten
=> Kitten(id: integer, cute: string)
> Rails.cache.read("kitten_1")
=> #<Kitten id: 1, cute: "no">
```

So the solution is to just load all the damn models at load. I thought about using the production value, config.cache_classes = true, in the  development environment, but then I would have to restart my server every time I modified any code. Then I thought why can't I just require it in an initialize file that only runs if it's in development mode.

Create a file in your config/initializers folder and put this in:

```ruby
if Rails.env == "development"
  Dir.foreach("#{Rails.root}/app/models") do |model_name|
    require_dependency model_name unless model_name == "." || model_name == ".."
  end
end
```