---
title: Facebook Connect Javascript Cookie and Ruby on Rails
description: "I wrote this class to verify(using Facebook's cookie verification article) and parse the Facebook Javascript Connect cookie."
slug: "facebook-connect-javascript-cookie-and-ruby-on-rails"
comments: true
date: "2010-10-25"
template: "post"
draft: false
category: "Open Source"
tags:
  - "Code"
  - "JavaScript"
  - "Ruby on Rails"
---

Update: I'm currently working this into a gem. Feel free to watch/use/contribute on github: [github.com/aaronvb/fb\_js\_connect](https://github.com/aaronvb/fb_js_connect)

I wrote this class to verify(using Facebook's cookie verification article) and parse the Facebook Javascript Connect cookie.

This can definitely work without Ruby on Rails, but you may need to change a few things.

Reference: Facebook Connect Javascript SDK [developers.facebook.com/docs/reference/javascript/](http://developers.facebook.com/docs/reference/javascript/)

To use this in Ruby on Rails, save this file into your RAILS_ROOT/lib folder. If you alter or use this code please contribute back!

```ruby
require 'digest/md5'
class FbJsConnect
  # When using the Facebook Javascript SDK to connect users to your site,
  # a cookie will be placed in your applications session store. This class
  # will verify your cookie, tell you if you're connected, and provide
  # you with a User and other information

  #
  # cookie = cookies["fbs_YOUR FACEBOOK APP ID"]
  # fb = FbJsConnect.new(cookie)
  # fb.connected => true or false
  # fb.verified? => true or false
  # fb.user => User or nil (Assuming you have a User class with the
  # attribute fb_uid)
  # fb.uid if fb.connected => uid if connected
  # fb.access_token if fb.connected => access_token if connected

  # Verification works by combining cookie key + values, minus sig,
  # appending app_secret, then MD5 hashing it.
  # The value of the MD5 should equal the sig value.

  attr_accessor :connected

  def initialize(cookie)
    @app_id = "" # YOUR FACEBOOK APP ID
    @app_secret = "" # YOUR FACEBOOK APP SECRET KEY
    fb_cookie = cookie
    if fb_cookie
      # remove any quotes in cookie. Facebook puts it's cookie in
      # quotes for some reason
      fb_cookie.gsub!('"','')
      # split cookie values into array by '&' symbol
      fb_cookie = fb_cookie.split("&")
      fb_cookie_hash = Hash.new
      fb_cookie.each do |c, i|
  	 key_value_arr = c.split("=") # split value into kv hash
  	 fb_cookie_hash[key_value_arr[0]] = key_value_arr[1] # add to new hash
      end

      @fb_cookie_hash = fb_cookie_hash # for verification

      # apply connected and fb_cookie_hash to class attributes IF verified
      if self.verified?
        @attributes = fb_cookie_hash
        self.connected = true
      end
    else
      # no cookie found so return false
      self.connected = false
    end
  end

  def verified?
    Rails.logger.debug("\nFB: digested sig: #{process}")
    Rails.logger.debug("FB: sig: #{@sig}\n\n")
    if process == @sig
      return true
    else
      return false
    end
  end

  def user
    # find user with UID
    #
    user = User.find(:first, :conditions => {:fb_uid =>
      @fb_cookie_hash["uid"]})
    if user
      return user # a user was found with UID
    else
      return nil # a user was not found
    end
  end

  def method_missing(name, *args)
    attribute = name.to_s
    if attribute =~ /=$/
      @attributes[attribute.chop] = args[0]
    else
      @attributes[attribute]
    end
  end

  private
  def process
    @sig = @fb_cookie_hash['sig'] # get sig to compare final hash
    payload = []
    @fb_cookie_hash.each do |k, v|
      payload.push "#{k}=#{v}" unless k == "sig"
    end
    digest = Digest::MD5.hexdigest(payload.sort.to_s + @app_secret)
    return digest
  end

end
```