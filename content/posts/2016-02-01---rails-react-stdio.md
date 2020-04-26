---
title: Ruby on Rails Wrapper for react-stdio
comments: true
description: "A simple Ruby on Rails wrapper for react-stdio."
date: "2016-02-01"
template: "post"
draft: false
slug: "rails-react-stdio"
category: "Open Source"
tags:
  - "Code"
  - "Ruby"
  - "React"
  - "Rails"
  - "JavaScript"
---

Over the past weekend I was exploring a different method to server side render(aka prerender) react components in Ruby on Rails.

Right now the two most popular  Rails + React gems are [react-rails](https://github.com/reactjs/react-rails) and [react on rails](https://github.com/shakacode/react_on_rails). Both of them rely on ExecJS(using therubyracer), with react-rails also supporting sprockets, to prerender react components.

If you're not familiar with prerendering react components on the server, it's simply Rails rendering the react component in the view before the DOM is loaded. This can be beneficial for SEO reasons.

I came across [react-stdio](https://github.com/mjackson/react-stdio) (not to be confused with studio) while working on issues in the react_on_rails repo: [#183](https://github.com/shakacode/react_on_rails/issues/183) and decided to see if I could easily implement it without rewriting a lot of the server rendering code. I started with react-rails as they have support for adding your own server renderer class.

Long story short, I was not able to easily integrate react-stdio into either libraries due to the way they render JS code. They both take the compiled components JS file and pass the string of JS code to be evaluated and returned, while also passing polyfills before the JS code. In react-stdio, you can only provide it with a path to the component, not a string of JS code. While I think it's definitely possible to integrate it react-stdio, I don't believe it's worth pursing as the current methods work perfectly fine.

Still, I think there could be uses outside of those libraries, which is why I decided to create this gem.

> This is a simple Ruby on Rails wrapper for react-stdio.
> &mdash; [rails_react_stdio](https://github.com/aaronvb/rails_react_stdio)

Using rails_react_stdio is actually extremely simple, just like react-stdio!

First make sure you have NPM installed and have react-stdio installed.

Add `rails_react_stdio` to your gemfile:

```ruby
gem 'rails_react_stdio', '~> 0.1.0'
```

If your path to react-stdio is not installed in the default location `/usr/local/bin/react-stdio`, add a configuration file to your initializers folder.

```ruby
RailsReactStdio.configure do |config|
  config.react_stdio_path = '/your/path/to/react-stdio'
end
```

```ruby
path_to_component = ::Rails.application.assets['components/HelloWorld'].filename

RailsReactStdio::React.render(path_to_component, {message: "aaron"})

> "<p data-reactid=\".1on4o1jtdds\" data-react-checksum=\"359665029\">Hello, aaron</p>"
```

If you find this useful give me feedback or open a PR. Also, thanks to react-stdio for providing a neat way to render react components.
