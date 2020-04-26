---
title: Recurring delayed_job with cron
description: "This one is easy and I use it quite often - particularly to scrape data at certain times during the day, and generate nightly statistics and reports."
slug: "recurring-delayed-job-with-cron"
comments: true
date: "2010-10-27"
template: "post"
draft: false
category: "Open Source"
tags:
  - "Code"
  - "Ruby on Rails"
---

Do you need a delayed_job job to happen at certain times or intervals?

This one is easy and I use it quite often - particularly to scrape data at certain times during the day, and generate nightly statistics and reports.

**Why would I use delayed_job to handle recurring jobs over rake task?**
Every time a rake task is issued, a new rails instance is spawned which takes time and memory to start and run. If a delayed_job daemon is already running, using that will save both. In my opinion, running a rake task that uses the rails environment is usually very costly in production and should be avoided if possible.

```ruby
#!/usr/bin/env ruby

# put this somewhere in your project, ie: /lib
# use:
# crontab -e
# */30 * * * * /usr/bin/ruby /your_rails_project/lib/this_file.rb
# that will insert this job into your delayed_job queue every 30 minutes.

require 'rubygems'
require 'mysql'

def parse_args(args)
  if args.empty?
    str = '[]\n\n'
  else
    str = '\n-'
    args.each do |k,v|
      str += ' :' + k.to_s + ': ' + v.to_s + '\n'
    end
  end
  return str
end

# Connect to database
# replace these values with your own:
# DB_USER is your database user
# DB_PASSWORD is your database user password
# DATABASE_NAME is your database name, ie: sample_app_development

dbh = Mysql.real_connect("localhost", "DB_USER", "DB_PASSWORD",
  "DATABASE_NAME")

# Get the current time in db format
db_time = Time.now.strftime("%Y-%m-%d %H:%M:%S")

# Insert data into table
# replace these values with your own:
# YOUR_MODEL is your model
# YOUR_METHOD is your method, or function
# YOUR_ARGUMENTS are your agrument(s), ie {:nws => 4, :asdf => "haha"}
# leave blank if no arguments

model = "YOUR_MODEL"
model_method = "YOUR_METHOD"
args = parse_args({YOUR_ARGUMENTS})

dbh.query("INSERT INTO `delayed_jobs` (`failed_at`, `locked_by`, `created_at`, `handler`, `updated_at`, `priority`, `run_at`, `attempts`, `locked_at`, `last_error`) VALUES(NULL, NULL, '#{db_time}', '--- !ruby/struct:Delayed::PerformableMethod \nobject: LOAD;#{model}\nmethod: :#{model_method}\nargs: #{args}', '#{db_time}', 0, '#{db_time}', 0, NULL, NULL)")
```