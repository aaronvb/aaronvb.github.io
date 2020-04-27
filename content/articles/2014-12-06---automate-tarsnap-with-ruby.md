---
title: Automate Tarsnap in OSX with Ruby
description: "Automate Tarnsap backups, Tarsnap logging, and Tarsnap backup rotations for OSX, with Ruby."
comments: true
date: "2014-12-06"
template: "post"
draft: false
slug: "automate-tarsnap-with-ruby"
category: "Open Source"
tags:
  - "Code"
  - "Backup"
  - "macOS"
  - "Ruby"
---
I finally found the time to setup proper backups with Tarsnap, [tarsnap.com](https://www.tarsnap.com). After following their installation guide, which was very easy to do, I was stuck with a dilemma - how can I automate, rotate, and log this?

My first attempt to automate tarsnap backups was a bash shell script and cron, which worked okay, but still not exactly how I wanted it. For one, I'm not the best at writing bash shell scripts. And two, cron isn't the best option for automated tasks in OSX. My solution was to use Ruby for the script, and Launchd for automation. What's really great about Launchd, versus cron, is that if my laptop is sleeping when my script is supposed to run, Launchd will run the job as soon as my laptop awakes.

My github repository for this is at [github.com/aaronvb/tarsnap_backup](https://github.com/aaronvb/tarsnap_backup). If you just want to install and run it, head there and clone the repository. Otherwise, I'm going to explain a little about what the script is doing and how Launchd works.

The script is fairly simple and relies on Ruby's system command call. The back up portion is straight forward, run tarsnap and append a timestamp to the backup name. The prune part is where the script will remove any backups after a certain period, in my case 3 days. It does this by getting a list of backups from tarsnap, and interating over each one, parsing the timestamp and checking if the date is past the prune date(3 days in the past from now).

The plist, which is the Launchd file, automates this script in OSX. The one provided in my github repo is what I use, and you'll need to modify it to work for you.

Give your job an appropriate, unique, name. This will be used to start/stop your job.

```xml
<string>com.aaronvb.tarsnap-backup</string>
```

Here we have the location to the Ruby exec, and the actual backup.rb file. In my case, I use RVM so my latest Ruby version was in the RVM folder. The backup.rb file is in my tarsnap folder.

```xml
<array>
  <string>/Users/aaronvb/.rvm/rubies/ruby-2.1.5/bin/ruby</string>
  <string>/Users/aaronvb/.tarsnap/tasks/backup.rb</string>
</array>
```

This is the location for your Launchd logs. This is totally optional, and mainly used for debugging. The tarsnap Ruby script will handle it's own logs.

```xml
<key>StandardOutPath</key>
<string>/Users/aaronvb/.tarsnap/logs/launchd.log</string>
<key>StandardErrorPath</key>
<string>/Users/aaronvb/.tarsnap/logs/launchd.log</string>
<key>StartCalendarInterval</key>
```

This is when Launchd will run this job. I have it set to run every day at Midnight, 8a, 12p, 4p, and 8p. Like I mentioned above, if your computer is sleeping while this job is supposed to run, it will run when it wakes. If you prefer to have it run every N seconds, instead of at exact times, you can use StartInterval.

```xml
<key>StartCalendarInterval</key>
<array>
	<dict>
		<key>Hour</key>
		<integer>0</integer>
		<key>Minute</key>
		<integer>0</integer>
	</dict>
	<dict>
		<key>Hour</key>
		<integer>8</integer>
		<key>Minute</key>
		<integer>0</integer>
	</dict>
	<dict>
		<key>Hour</key>
		<integer>12</integer>
		<key>Minute</key>
		<integer>0</integer>
	</dict>
	<dict>
		<key>Hour</key>
		<integer>16</integer>
		<key>Minute</key>
		<integer>0</integer>
	</dict>
	<dict>
		<key>Hour</key>
		<integer>20</integer>
		<key>Minute</key>
		<integer>0</integer>
	</dict>
</array>
```

StartInterval example. This will run every hour.

```xml
<key>StartInterval</key>
<integer>3600</integer>
```

[launchd.info](https://www.launchd.info/) is a great resource for Launchd.

The last part to getting it running is placing the plist in the correct folder and running it properly. I have my plist in /Library/LaunchDaemons because I want it to run system wide and not based on the user. If you place it in this folder, you NEED to load and start the job using `sudo`.
