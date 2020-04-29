---
title: Moving from Linode to Heroku
description: "The last time I checked out Heroku was about 2 years ago, which I later dismissed because at the time it seemed like having your own VPS was the right thing to do."
slug: "moving-from-linode-to-heroku"
comments: true
date: "2013-01-16"
template: "post"
draft: false
category: "Tutorial"
tags:
  - "DevOps"
  - "Heroku"
  - "Linux"
  - "Ruby on Rails"
---

I recently made the move from Linode to Heroku for my personal sites. The last time I checked out Heroku was about 2 years ago, which I later dismissed because at the time it seemed like having your own VPS was the right thing to do.

Having your own VPS sounds good in theory, but in reality it's not, for me at least. I liked being able to throw up random projects, host my friends projects, and tinker with new frameworks and languages. I maybe did that once or twice out of the 4 years I had my own VPS. In reality, I'm way to busy to do any of that. I started to get lazy on updates, and security patches. The traffic my personal sites receive are so minimal they don't need a VPS.

After my week at the Aloha Ruby Conf, I noted to myself to check out Heroku once again, to see what has changed. To my surprise, A LOT has changed. There's the new cedar stack, updated gem which is really awesome to use, procfile, etc, I could go on.

Anyway, I read through all their documents, which are amazingly good, and then signed up to try their free tier, 1 Dyno, which seems like a perfect size for my site.

The first thing I had to do was switch my applications database from MySQL to PostgreSQL because Heroku has native support for PostgreSQL. You can use MySQL through one of their add-ons if you wish.

```ruby
# gem 'mysql2'
gem 'pg'
```

Then I got my site up on Heroku by logging in and deploying.

```ruby
$ heroku login
$ heroku create
$ git push heroku master
$ heroku run rake:db:migrate
```

I really like Unicorn([yhbt.net/unicorn/](https://yhbt.net/unicorn/)) as my webserver and was excited to see that they fully support it, and all I needed to do was add one line to my Procfile. I also want to mention that even though 1 Dyno is supposed to only have 1 level of concurrency, with Unicorn I can have multiple concurrency.

Add Unicorn the Gemfile.

```ruby
gem 'unicorn'
```

I added a Unicorn config file to my project by creating `config/unicorn.rb`. In the file I can configure the number of workers and timeout.

```ruby
worker_processes 5
timeout 30
preload_app true

before_fork do |server, worker|
  # Replace with MongoDB or whatever
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.connection.disconnect!
    Rails.logger.info('Disconnected from ActiveRecord')
  end

  # If you are using Redis but not Resque, change this
  if defined?(Resque)
    Resque.redis.quit
    Rails.logger.info('Disconnected from Redis')
  end

  sleep 1
end

after_fork do |server, worker|
  # Replace with MongoDB or whatever
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.establish_connection
    Rails.logger.info('Connected to ActiveRecord')
  end

  # If you are using Redis but not Resque, change this
  if defined?(Resque)
    Resque.redis = ENV['REDIS_URI']
    Rails.logger.info('Connected to Redis')
  end
end
```

Now that Unicorn is set up, Heroku needs to use Unicorn instead of its default web server. To tell Heroku to use Unicorn, they've provided the Procfile. I created a file named `Procfile` in the project root directory. Inside the web server can be configured.

```ruby
web: bundle exec unicorn -p $PORT -c ./config/unicorn.rb
```

After that's pushed to Heroku, I can check to make sure Unicorn is running by using `$ heroku ps`.

```ruby
$ heroku ps
> === web: `bundle exec unicorn -p $PORT -c ./config/unicorn.rb`
   web.1: up 2013/01/16 14:21:20 (~ 1h ago)
```

I also needed access to cron or something similar to schedule my nightly Rake that updates the photos on the front page to my latest Flickr photos. Once again that took me a few minutes to set up through their web interface.

First I created my rake task in `lib/tasks/flickr_update.rake`. It's a simple script that updates a table with the last 3 photos I posted to flickr. I'm using the [gem 'fleakr'](https://rubygems.org/gems/fleakr) to do this. I have a RecentPhoto model that has the attributes: title, url(url to the photos flickr page), image_url(url to the exact location of the image file).

```ruby
namespace :flickr  do
  desc "update flickr photos on index page"
  task :update => :environment do
    Fleakr.api_key = 'xxxxxx' # replace with your Flickr API key
    user = Fleakr.user('xxxx') # replace with your Flickr Username
    RecentPhoto.destroy_all # remove all photos from table
    3.times do |num|
      photo = user.photos[num]
      image_url = photo.medium.url
      image_url = image_url[0..-5] << "_q.jpg" # using the q version of this photo which is a square thumbnail.
      RecentPhoto.create(title: photo.title, url: photo.url, image_url: image_url)
    end
  end
end
```

In the Heroku web application settings add the [Scheduler add-on](https://elements.heroku.com/addons/scheduler). Then add the heroku run command for that rake task.

[![heroku_scheduler](../assets/Screen%20Shot%202013-01-16%20at%204.12.02%20PM.png)](../assets/Screen%20Shot%202013-01-16%20at%204.12.02%20PM.png)

That pretty much covers my move from Linode to Heroku. I highly suggest reading through the Heroku documents.

Side note: The only downside to Heroku that I encountered was not being able to write to disk. Since my site is entirely static, the comments are javascript, I relied on page caching to keep the load time fast. When I switched to Heroku I had to disable page caching because I'm not able to write to the cached html pages to disk.