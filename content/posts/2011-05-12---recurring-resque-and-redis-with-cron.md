---
title: Recurring resque and redis with cron
description: "Moving one of my projects over from delayed_job to resque/redis, for reasons I wont go into here, I needed to have a few of my workers on a cron job."
slug: "recurring-resque-and-redis-with-cron"
comments: true
date: "2011-05-12"
template: "post"
draft: false
category: "Open Source"
tags:
  - "Code"
  - "Ruby on Rails"
  - "Redis"
---

Moving one of my projects over from delayed_job to resque/redis, for reasons I wont go into here, I needed to have a few of my workers on a cron job. I was initially going to use the resque-scheduler plugin, but the fact that it runs as a daemon made me a little nervous. I didn't want to worry about watching the scheduler process for memory leaks and or crashes, and cron is a proven, reliable, scheduling service in itself.

Basically, I took the same concept from my other post, [Recurring delayed\_job with cron](/articles/recurring-delayed-job-with-cron) and applied it to redis, instead of using mysql as I did with delayed_job. It works by manually injecting jobs into the queue without using the Rails environment, saving memory, cpu, and time, and also able to be run externally by the system cron.

In this example I'm going to use a Payment model, which holds payment information, and an 'update' method which should be run nightly at 0000. I'm using Rails 3 as well, which uses the 'mysql2' gem.

This is the resque worker.
```ruby
class UpdatePayment
  @queue = :update_payment

  def self.perform(payment_id)
    payment = Payment.find_by_id(payment_id)
    if payment
      # update payment logic goes here
    end
  end
end
```

This is the ruby file that the cron will run. I usually place this in root.rails/lib/crons folder.
```ruby
require 'redis'
require 'mysql2'

# assuming redis is running on the default port.
# if not, example: redis = Redis.new(:host => "10.0.1.1", :port => 6380)
redis = Redis.new

# Make sure queue exists, if not create it. When clearing a queue with the resque web interface, resque removes the queue, so here we just check to make sure it exists.
if redis.sismember('resque:queues', 'update_payment') == false
  redis.sadd('resque:queues', 'update_payment')
end

# Mysql DB information
client = Mysql2::Client.new(:host => "localhost", :username => "root", :database => 'your_project_development')

# query the db for all payment records
results = client.query("SELECT `payments`.* FROM `payments` ORDER BY id asc")

# create a job in the update_payment queue that will update each payment, pass each payment id
results.each do |row|
  redis.rpush('resque:queue:update_payment', "{\"class\":\"UpdatePayment\",\"args\":[#{row['id']}]}")
end
```

And this is what goes in the crontab, which can be accessed by typing 'crontab -e' in the console.
```ruby
# m h  dom mon dow   command
0 0 * * * /usr/bin/ruby /path/to/your/file/cron_payment_update.rb
```

For reference:

Redis - [https://redis.io](https://redis.io)

Resque - [https://github.com/resque/resque](https://github.com/resque/resque)

Resque Intro - [https://github.blog/2009-11-03-introducing-resque](https://github.blog/2009-11-03-introducing-resque)

Redis Ruby Gem(should get installed when installing resque) - [https://github.com/redis/redis-rb](https://github.com/redis/redis-rb)