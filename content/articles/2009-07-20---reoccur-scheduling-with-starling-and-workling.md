---
title: Reoccur Scheduling With Starling and Workling
description: "How I moved from BackgrounDRb to Starling and Workling to not only manage my daily worker, but also everything else that needed regular background processing."
slug: "reoccur-scheduling-with-starling-and-workling"
comments: true
date: "2009-07-20"
template: "post"
draft: false
category: "Tutorial"
tags:
  - "Code"
  - "Ruby on Rails"
---

One of the main reasons I first used BackgrounDRb was for it's ability to use a cron like schedule that could reoccur at whatever time or date I specified. It was very easy infact, by just writing the cron schedule in the config file for the worker. I was satisfied and stuck with BDRb for just that reason, until I realized how much memory BDRb was using.

Not only was I relying on BDRb to handle a worker that would reoccur nightly, I had also moved a lot of features that didn't require immediate user feedback, to the background(ie. the message system). So not only was I looking for an alternative to handle my daily worker, but also everything else that needed regular background processing.

I did some research on the current background processing methods  and came across an excellent blog post that provided me with a clean solution to all my problems. [transfs.com/devblog/2009/04/06/goodbye-backgroundrb-hello-workling-starling](https://web.archive.org/web/20090802045408/https://www.transfs.com/devblog/2009/04/06/goodbye-backgroundrb-hello-workling-starling/).

Starling and Workling.  There's tons of information on getting it setup. I recommend watching the Railscast by Ryan Bates - [Starling and Workling](http://railscasts.com/episodes/128-starling-and-workling).

Starling is the queue server, which Workling polls and then executes workers depending on the task. Easy enough to understand. Even better, Starling is  a separate process outside of your rails application. Meaning, if your rails application gets restarted or stopped, or if Workling is off, everything in the Starling queue gets saved. That's great and all, but the fact that Starling is a separate process and is using the the same design as memcache, means I can slip anything I want into the Starling queue outside of my rails application! To rephrase that, I'm able to start a background process in my rails application without having to be in my rails application.

Let's continue with some code examples.

In my project I have a TemporaryShoppingCart model which handles temporary shopping carts that a user might create while visiting my site. At the start of each day(00:00:00 on my server), I want a background worker to clear the temporary shopping carts, but also create a record of the event and record how many carts were removed. The record would be stored in another model, say RemovedTemporaryShoppingCart so I can access that data later through an admin page. Note, I'm not sure how practical this is for a real application, I'm just creating this example off the top of my head.

The first step is to create a method in TemporaryShoppingCart model that will do everything I stated above.

```ruby
def self.empty_self
  #create a new record in RemovedTemporaryShoppingCart model with the total carts removed
  RemovedTemporaryShoppingCart.create(:total => self.all.length)
  #deletes all records in this model. http://api.rubyonrails.org/classes/ActiveRecord/Base.html#M002275
  delete_all
end
```

Nothing fancy there. Trying to keep as much code in the model rather than in the worker. Next I create the Workling worker.

```ruby
#app/workers/daily_worker.rb
class DailyWorker < Workling::Base
  def empty_temporary_shopping_carts(options)
    TemporaryShoppingCart.empty_self
  end
end
```

Make sure to restart Workling and the rails application to generate the new worker, and that Starling is running as well. Normally I can start the worker through the rails app by 'DailyWorker.async_empty_temporary_shopping_carts()' but that's not what I want to do in my case.

If you watched the Starling Workling Railscast by Ryan Bates, near the end of the cast, Ryan shows you how Starling works by connecting to it through a memcached protocol.  My next example is the exact same except with real data to start the worker.

Load up irb from the terminal by typing 'irb'.

```ruby
>> require 'rubygems'
=> false *returned false because rubygems is already initialized*
>> require 'memcache'
=> true
>> starling = MemCache.new('localhost:22122') *change ip/port if not default*
=> <MemCache: 1 servers, ns: nil, ro: false>
>> starling
=> <MemCache: 1 servers, ns: nil, ro: false>
>> starling.set 'daily_workers__empty_temporary_shopping_carts', {}
=> "STORED\r\n"
>>
```

There should be a new record in RemovedTemporaryShoppingCart model which means the worker did the job. Great I just started a worker inside my rails application from outside my rails application. So now how do I get it to run on a schedule? Thankfully in that first link that I mentioned, the author realized they could use the built in cron feature in the linux operating system to run a ruby script similar to what we did in the irb above.

```ruby
#!/usr/bin/env ruby
#lib/nightly_worker_for_cron.rb
require "rubygems"
require "memcache"

host = "localhost"
port = 22122
starling = MemCache.new "#{host}:#{port}"

case ARGV[0]
  when 'empty_temp_carts'
    starling.set 'daily_workers__empty_temporary_shopping_carts', {}
end
```

This file can be anywhere but for ease of editing access I threw it in my 'lib' folder and also named it 'nightly_worker_for_cron.rb'.

Now to add it to my crontab I just type 'crontab -e' in my console and insert '0 0 * * * ruby /the_path_to_my_rails_app/lib/nightly_worker_for_cron.rb empty_temp_carts' on any line then save. Done!

I wrote this to mainly show people how useful Starling and Workling can be. It might not be as easy to setup as delayed_job or straight forward, but there are a lot of neat things that it can do that delayed_job cannot. Instead of trying to compare which one of these background methods is better, decide on what you NEED your application to do and figure out which one will work for you.