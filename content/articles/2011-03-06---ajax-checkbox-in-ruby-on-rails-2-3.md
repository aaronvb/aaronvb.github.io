---
title: Ajax checkbox in Ruby on Rails 2.3
description: "Neat trick if you want to use Ajax on a checkbox and don't want to create a separate function for onclick."
slug: "ajax-checkbox-in-ruby-on-rails-2-3"
comments: true
date: "2011-03-06"
template: "post"
draft: false
category: "Open Source"
tags:
  - "Code"
  - "Ruby on Rails"
---
Neat trick if you want to use Ajax on a checkbox and don't want to create a separate function for onclick.

```ruby
# Note model has a column, :important, :boolean, :default => false

# This goes in your HTML erb

<% @user.notes.find(:all, :order => 'updated_at DESC').each do |user_note| %>
<% remote_form_for user_note, {:url =>
  remote_toggle_important_user_note_path(:user_id => @user.id, :id => user_note.id)} do |f| %>
<%= f.check_box :important, :onclick => "$('edit_user_note_#{user_note.id}').onsubmit()" %><%= f.label :important %>
<% end %>
<% end %>

# routes

map.resources :users do |user|
  user.resources :notes, :member => { :remote_toggle_important => :put }
end

# notes controller

def remote_toggle_important
  @note = UserNote.find_by_id(params[:id])
  if @note
    @note.update_attributes(params[:user_note])
  end
end
```