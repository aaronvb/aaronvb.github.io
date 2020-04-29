---
title: Validations For Multiple Nested Model Forms
description: "Here's a little trick I found when handling multiple nested models in a form that require validations for each model."
slug: "validations-for-multiple-nested-model-forms"
comments: true
date: "2010-03-06"
template: "post"
draft: false
category: "Tutorial"
tags:
  - "Code"
  - "Ruby on Rails"
---

Here's a little trick I found when handling multiple nested models in a form that require validations for each model.

Spec time. For example, we have a model, Author, which has_many Books and has_many Magazines. Book and Magazine has validations. On a single page, we create a three forms for Book, Magazine, and Author. There is also an option select that a user can choose if the Author has a Book or a Magazine.

Pretty straight forward. Let's do some code.

```ruby
#models/author.rb
class Author < ActiveRecord::Base
  has_many :books
  has_many :magazines

  accepts_nested_attributes_for :books
  accepts_nested_attributes_for :magazines

  validates_presence_of :name
end
```

```ruby
#models/book.rb
class Book < ActiveRecord::Base
  belongs_to :author
  validates_presence_of :title,
                        :genre
end
```

```ruby
#models/magazine.rb
class Magazine < ActiveRecord::Base
  belongs_to :author
  validates_presence_of :title,
                        :genre
end
```

Basic model setup with validations and accepts_nested_attributes_for. More info on that can be found in the [Ruby on Rails API - Nested Attributes](https://api.rubyonrails.org/classes/ActiveRecord/NestedAttributes/ClassMethods.html).

Moving on to the form setup..

```ruby
#views/authors/new.html.erb
<% form_for @author do |f| %>
<%= f.error_messages %>
  <p>
    <%= f.label :name %><br />
    <%= f.text_field :name %>
  </p>
  <p>
    <%= f.radio_button("media_type", "book" %><%= f.label :media_type_book, 'Book' %> [?]
    <%= f.radio_button("media_type", "magazine" %><%= f.label :media_type_magazine, 'Magazine' %> [?]
  </p>
  <% f.fields_for :books do |book| %>
    <p>
      <%= book.label :title %><br />
      <%= book.text_field :title %>
    </p>
    <p>
      <%= book.label :genre %><br />
      <%= book.text_field :genre %>
    </p>
  <% end %>

  <% f.fields_for :magazines do |magazine| %>
    <p>
      <%= magazine.label :title %><br />
      <%= magazine.text_field :title %>
    </p>
    <p>
      <%= magazine.label :genre %><br />
      <%= magazine.text_field :genre %>
    </p>
  <% end %>
  <%= f.submit 'Submit' %>
<% end %>
```

That sets up the form with the nested model, now for the controller code.

```ruby
#controllers/authors_controller.rb
class AuthorsController < ApplicationController
  def new
    @author = Author.new
    books = @author.books.build #this builds the nested form in the view
    magazines = @author.magazines.build #this builds the nested form in the view
  end

  def create
    param_hash = params[:author]
    if params[:author][:media_type] == "book"
      param_hash.delete("books_attributes")
    elsif params[:author][:media_type] == "magazine"
      param_hash.delete("magazines_attributes")
    end
    @author = Author.new(param_hash)
    @author.save
  end
end
```

Instead of passing the params straight to Author.new, it's put into a hash variable. Then the params get checked for a title and genre, if empty delete the key from the hash and pass to Author.new. Activerecord wont see the book param and will skip the validations for it.