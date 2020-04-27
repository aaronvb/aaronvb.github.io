---
comments: true
title: Ember.js Flash Messages
date: "2016-03-30"
template: "post"
draft: false
slug: "ember-js-flash-messages"
category: "Open Source"
legacyArticleId: "49"
tags:
  - "Code"
  - "Ember.js"
  - "CoffeeScript"
---

This is a simple way to create flash messages that are similar to the Ruby on Rails flash messages. I took from Yehuda Katz's answer on [this Stack Overflow post](https://stackoverflow.com/a/14301065/141190), and extended it to work with the updated controllerFor/needs changes and closing on transitions.

#### application.handlebars
```handlebars
<div class="container">
  {{#if notification}}
  <div {{bindAttr class=":alert notification.type"}} id="notification">
    <button type="button" class="btn-close" {{action "closeNotification"}}></button>
    {{#if notification.title}}
    <h3>{{notification.title}}</h3>
    {{/if}}
    {{notification.message}}
  </div>
  {{/if}}
  {{outlet}}
</div>
```

#### application_controller.js.coffee
```coffee
App.ApplicationController = Ember.Controller.extend

  # close notification alert
  # bind to action in template, example: {{action "closeNotification"}}
  # detects if persists and closes on next transition
  #
  closeNotification: ->
    notification = @get('notification')
    if notification
      if notification.persists
        console.log "Notification detected, clearing alert notification after next transition"
        notification.persists = null
      else
        console.log "Notification detected, clearing alert notification now"
        this.set('notification', null)

  # notification alert
  # type can be: error, info, success
  # example: @get('controllers.application').notify({title: "Error!", message: "An error occurred in foobar.", type: "alert-error"})
  #
  notify: (options) ->
    this.set('notification', options)
```

#### posts_controller.js.coffee
```coffee
App.PostsNewController = Ember.ObjectController.extend
  needs: ["application"] # allows access to application controller functions

  # post save
  #
  save: ->
    @set('model.title', @get('title'))
    @set('model.description', @get('description'))

    post = @get('model')

    # if post is not valid, show flash message
    #
    post.on 'becameInvalid', this, (obj) ->
      @get("controllers.application").notify({
        title: "Error!",
        message: "There was an error creating this post.",
        type: "alert-error"})

    # if post was created transition to posts index, show flash message and persist it to next transition
    #
    post.on 'didCreate', this, () ->
      @get("controllers.application").notify({
        title: "A new post!",
        message: "#{@get('model.title')} was created.",
        type: "alert-success",
        persists: true})
      @transitionToRoute('posts.index')

    # commit post to server
    #
    @get('model.transaction').commit()
```

#### router.js.coffee
```coffee
App.BeforeRoute = Ember.Route.extend
  # close any open notifcations before a route loads
  #
  activate: ->
    @controllerFor('application').closeNotification()

App.PostsIndexRoute = App.BeforeRoute.extend()
```

In the application.handlebars template I create a condition that checks if the notification variable is set, and if it is, display it with it's message and alert-type class(error, success, info, etc).

In the application controller, there's a function that creates the notification and passes options to it, and there's also a function that closes the notification. The closeNotification first checks for a 'persists' flag and if it doesn't exist it sets the notification variable to null, which closes it. If a 'persists' flag does exist, it sets it the flag to null and skips closing the notification. On the next transition, the 'persists' flag wont exist and the notification will be closed.

In the posts new controller, at the top I have a needs array, which let's the controller know that we need access to the application controller. The notifications are hooked into the 'on' callbacks for the post model, and called by using @get('controllers.application').notify(). In earlier versions of Ember.js you would directly use the controllerFor() function, but that was deprecated for 'needs'.

Lastly in the router, I created an App.BeforeRoute extension of Ember.Route which all of my routes extend from. This way every route will execute the activate function, which executes the closeNotification function, before every route loads.