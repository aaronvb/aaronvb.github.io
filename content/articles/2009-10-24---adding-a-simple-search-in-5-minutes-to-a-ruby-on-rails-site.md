---
title: Adding A Simple Search In 5 Minutes to a Ruby on Rails Site
description: "Prototyping a site in Ruby on Rails and need to add a simple search feature in less than 5 minutes?"
slug: "adding-a-simple-search-in-5-minutes-to-a-ruby-on-rails-site"
comments: true
date: "2009-10-24"
template: "post"
draft: false
category: "Tutorial"
tags:
  - "Code"
  - "Ruby on Rails"
---

Prototyping a site in Ruby on Rails and need to add a simple search feature in less than 5 minutes?

Note: This should be for smaller projects because I'll be using regular SQL queries for searching. If you're looking for something more advanced, try [thinking\_sphinx(sphinx engine)](https://freelancing-gods.com/thinking-sphinx/v4/) or [sunspot\_solr(java lucene solr engine)](https://sunspot.github.io/).

I'll be using [Searchlogic](https://github.com/binarylogic/searchlogic) and [will\_paginate](https://github.com/mislav/will_paginate) in this demo.

```ruby
#install searchlogic
sudo gem install searchlogic

#install will_paginate
gem sources -a http://gemcutter.org
sudo gem install will_paginate
```

Then add the gem to the environment file.

```ruby
#config/environment.rb

config.gem "binarylogic-searchlogic", :lib => "searchlogic"
config.gem 'will_paginate', :version => '~> 2.3.11'
```

If you prefer to use github or the plugin version, check out [their docs](https://rdoc.info/projects/binarylogic/searchlogic). I also suggest reading their docs to learn more about all the neat functions Searchlogic can do. It's a very powerful and useful plugin.

We'll be adding the search to Posts, so let's start by adding the search route to our posts.

```ruby
#config/routes.rb

map.resources :posts, :collection => { :search => [ :post, :get ] }
```

This will give you the path /posts/search GET and POST.

Next add the search method to the PostsController.

```ruby
#app/controllers/posts_controller.rb

class PostsController < ApplicationController

  def index
    @posts = Post.paginate(:all, :order => 'created_at desc', :per_page => 25, :page => params[:page])
  end

  def search
    if request.post?

      #pass the post into a get with the 'q' param
      redirect_to search_posts_path(:q => params[:search][:query])

    elsif request.get?

      unless params[:q].blank?

        #Searchlogics title_like_all to search within titles in the Post model for any of the words in the query.
        #words in the string are split into an array by spaces
        search = Post.title_like_all(params[:q].to_s.split).descend_by_created_at

        #paginate the results
        @posts = search.paginate(:per_page => 25, :page => params[:page])

        #pass the query object to the view to let the user know what they searched for
        @query = params[:q]

      end

      #render the Post index.html.erb
      render 'index'

    end
  end

end
```

The last part is the search form in your view.

```ruby
<p>
	<% form_for :search, :url => { :controller => 'posts', :action => 'search' } do |f| %>
		<%= f.text_field :query, :value => @query%>
		<%= f.submit "Search", :disable_with => "Searching..."  %>
	<% end %>
</p>
```