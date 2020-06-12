---
title: Rails Inspired Logging in Go
date: "2020-05-07"
template: "post"
comments: true
description: "Verbose logging in development is one of the few things I miss about Ruby on Rails. I made two libraries to bring that to Go and explain how to set that up with middleware."
slug: "rails-inspired-logging-in-go"
category: "Open Source"
tags:
  - "Code"
  - "Rails"
  - "Go"
  - "Logging"
  - "Middleware"
draft: true
---

One of the few things I miss from [Ruby on Rails](https://rubyonrails.org) is the verbose logging the framework provides to you in development. If you're not coming from Ruby on Rails I believe this will still be applicable and beneficial to your development in Go. Let me show you an example of a Ruby on Rails request log.

insert photo of rails lo

Before we jump into the details, I'd like to preface this by saying this guide to logging is meant to be used in the **development** environment. While I think logging should be done in production as well, the depth of logging should be limited in any production environment where we need to take security into account.



4 parts:

- Log Request
- Log Params
- Log SQL Queries
- Log Time