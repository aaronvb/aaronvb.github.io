---
title: Pagination and page cache sweepers in Rails 3
slug: "pagination-and-page-cache-sweepers-in-rails-3"
comments: true
date: "2011-10-15"
template: "post"
draft: false
category: "Open Source"
tags:
  - "Code"
  - "Ruby on Rails"
---
This is how I handle page cache sweeping in Ruby on Rails 3.1 with pagination. This should work with earlier versions of Ruby on Rails.

First of all, I'm using the `gem 'will_paginate', '~> 3.0'` and have my routes setup to match the url and replace the `?page=` with `/page/2`.

In routes.rb:
```ruby
match '/articles/page/:page' => 'articles#index'
```

So now you want to do page caching on your site, but the problem is you can't sweep the folder and the page numbers inside of them normally within the sweeper.

For example, you have your index action which uses pagination:

```ruby
def index
  @articles = Article.paginate(:page => params[:page], :per_page => 5, :conditions => {:published => true}, :order => ('created_at DESC'))
end
```

and have it properly cached and watched by the sweeper:

```ruby
caches_page :index
cache_sweeper :article_sweeper
```

When the pages get cached, they'll be placed in `/public/articles/page/1.html` and so forth. The problem is getting the sweeper to delete the pages when there's a change to the Article model.

Solution: Manually remove each page on the sweep.

```ruby
class ArticleSweeper < ActionController::Caching::Sweeper
  observe Article # This sweeper is going to keep an eye on the article model

  # If our sweeper detects that a article was created call this
  def after_create(article)
    expire_cache_for(article)
  end

  # If our sweeper detects that a article was updated call this
  def after_update(article)
    expire_cache_for(article)
    expire_cache_for_single(article)
  end

  # If our sweeper detects that a article was deleted call this
  def after_destroy(article)
    expire_cache_for(article)
    expire_cache_for_single(article)
  end

  private
  def expire_cache_for_single(article)
    expire_page(:controller => 'articles', :action => 'show')
  end

  def expire_cache_for(article)
    # Expire the index page now that we added or modified an article
    expire_page(:controller => 'articles', :action => 'index')
    # expire the index.html which is created by root_path
    expire_page '/index.html'

    # manually remove pages(1.html, 2.html, etc)
    if File.exist?("#{Rails.root}/public/articles/page") # check to make sure directory exists
      Dir.foreach("#{Rails.root}/public/articles/page") do |entry|
        unless entry == "." || entry == ".." || entry == ".gitignore" # ignore dot files
          File.delete("#{Rails.root}/public/articles/page/#{entry}")
        end
      end
    end
  end
end
```