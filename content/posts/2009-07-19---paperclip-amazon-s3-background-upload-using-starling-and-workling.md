---
title: Paperclip Amazon S3 Background Upload Using Starling and Workling
description: "We know it’s very easy to add S3 support into Paperclip, and there’s tons of information on setting that up. It works flawless and it’s simple, yet your upload now takes twice as long in comparison to using your servers filesystem for storage. The problem is pretty obvious and I’ll explain why in this article."
slug: "paperclip-amazon-s3-background-upload-using-starling-and-workling"
comments: true
date: "2009-07-19"
template: "post"
draft: false
category: "Open Source"
tags:
  - "Code"
  - "Ruby on Rails"
---

I spent several days searching for ANY information on background uploads to Amazon S3 with [Paperclip](https://github.com/thoughtbot/paperclip) and I just couldn’t find anything concrete. There were a few posts on the Paperclip Google Code board that talked about it but with no clear examples of how to do it.

Anyway, we know it’s very easy to add S3 support into Paperclip, and there’s tons of information on setting that up. It works flawless and it’s simple, yet your upload now takes twice as long in comparison to using your servers filesystem for storage. The problem is pretty obvious and I’ll explain why in this example in case you’re wondering.

Example A(filesystem)

1) User uploads a file
2) Application re sizes file into thumbnails

Example B(Amazon S3)

1) User uploads a file
2) Application re sizes file into thumbnails
3) Application then connects to Amazon S3 and uploads thumbnail
4) Repeat 3 until each thumbnail is uploaded

As you can see in Example B, the more thumbnails you need the longer your upload is going to take because Paperclip needs to send each file to Amazon S3 one at time. All the while a user is still waiting for the website to respond back. If you use New Relic RPM you’ll notice that your Apdex gets destroyed by this. Which is basically telling you that a user is waiting longer than a second(more like 3-5 seconds) for an upload process.

Although there’s nothing that can be done about the initial upload, why does the user need to wait around while the application uploads to Amazon S3(which could take 2-5 seconds longer)?

I worked on several ways to get Paperclip to process it’s Amazon S3 storage in the background that led me to more complications than a solution. I realized I wanted to try my best to not modify the original Paperclip code so there wouldn’t be any problems updating Paperclip in the future.

The next idea was to have some sort of ‘syncing’ to Amazon S3 system. Let Paperclip upload to the filesystem, then have a background process move the files to Amazon S3, then delete the files off the filesystem.

Let’s assume you already have your rails app, starling/workling installed and running, and paperclip installed and working on the model of your choice. Let’s also assume we’re applying this to a User model and the attachment is an avatar. You’ll also need the aws-s3 gem(http://amazon.rubyforge.org) and add that to your environment.rb.

```console
sudo gem install aws-s3
```

```ruby
#environment.rb
config.gem 'aws-s3', :lib => 'aws/s3'
```

First let’s modify the Paperclip settings in our User model.

```ruby
has_attached_file   :avatar,
                    :styles => { :large => "800x800&>", :medium => "300x300&>", :thumb => "100x100#", :tiny => "50x50#", :really_tiny => "25x25#"},
                    :storage => :filesystem,
                    :url => "http://s3.amazonaws.com/webapps3bucketname/:attachment/:id/:style/:basename.:extension",
                    :path => "tmp/paperclip_uploads/:attachment/:id/:style/:basename.:extension"
```

The :url is set to the Amazon’s S3 link so that when we generate urls with object.avatar.url(:medium) it will output the Amazon S3 url instead of the filesystem path. I also set the :path to the location I want the file to be uploaded to and re sized. I chose the tmp folder since it seemed appropriate. (Note: I’m considering moving the location to system because it’s a shared folder across capistrano.)

A new column is needed for this model to let us know when the background uploading is being processed.

```console
script/generate migration add_processing_upload_to_user processing_upload:boolean
rake db:migrate
```

It’s your choice if you want to set the default to true, assuming upon creation of a User record that an upload will be included. In my case, a user gets created first and if the user decides to upload an avatar, it’s done through the user settings later, so  I set the default to false.

Next we’ll setup the worker which will handle the upload to Amazon S3.

```ruby
#app/workers/paperclip_background_upload_worker.rb
class PaperclipBackgroundUploadWorker < Workling::Base
  def upload_to_amazon_s3(options)
    logger.info("Begin uploading #{options[:type]} to Amazon S3...")
    #find the user and the avatar
    @user = User.find_by_id(options[:id])
    @avatar = @user.avatar

    #connect to amazon s3
    logger.info("Connecting to Amazon S3...")
    AWS::S3::Base.establish_connection!(
                                        :access_key_id     => 'ACCESSKEYID',
                                        :secret_access_key => 'SECRETACCESSKEY'
                                        )
    #first we store the original
    logger.info("Uploading original image...")
    AWS::S3::S3Object.store(@avatar.path_s3(:original), open("#{RAILS_ROOT}/#{@avatar.path(:original)}"), 'YOUR_AMAZONS3_BUCKET_NAME', :access => :public_read)
    #then thumbnails
    @avatar.styles.each do |key, value|
      logger.info("Uploading #{key} image...")
      AWS::S3::S3Object.store(@avatar.path_s3(key), open("#{RAILS_ROOT}/#{@avatar.path(key)}"), 'YOUR_AMAZONS3_BUCKET_NAME', :access => :public_read)
    end
    #start clean up, files first then directories
    logger.info("Removing original from local filesystem...")
    #remove original file
    File.delete("#{RAILS_ROOT}/#{@avatar.path(:original)}")
    #remove thumbnail files
    @avatar.styles.each do |key, value|
      logger.info("Removing #{key} from local filesystem...")
      File.delete("#{RAILS_ROOT}/#{@avatar.path(key)}")
    end
    #delete directories
    logger.info("Removing directories...")
    #remove original folder
    Dir.delete("#{RAILS_ROOT}/tmp/paperclip_uploads/avatars/#{@user.id}/original")
    #remove thumbnail folders
    @avatar.styles.each do |key, value|
      Dir.delete("#{RAILS_ROOT}/tmp/paperclip_uploads/avatars/#{@user.id}/#{key}")
    end
    #remove avatar user_id folder
    Dir.delete("#{RAILS_ROOT}/tmp/paperclip_uploads/avatars/#{@user.id}")

    #set processing to false now that we are finished
    @user.processing_upload = false
    @user.save

    logger.info("Finished uploading to Amazon S3.")
  end
end
```

This is pretty simple. The worker uses the aws-s3 gem to upload the files and once it finishes they get removed from the filesystem. You’ll need to include your Amazon S3 Access Key ID and Secret Access Key and also fill in your Amazon S3 Bucket name that the files are getting uploaded to where it says ‘YOUR_AMAZONS3_BUCKET_NAME". You may also notice a new method named ’path_s3’ which I had to add to Paperclips attachment file.

Open up the ‘attachment.rb’ file in the ‘vendor/plugins/paperclip/lib/paperclip/’ folder.  Under ‘def initialize’ add the two ‘@path_s3 =’ lines code(around line 47):

```ruby
      @dirty             = false
      #a new hash value and key for the s3 path we define in the model
      @path_s3           = options[:path_s3]
      @path_s3           = @path_s3.call(self) if @path_s3.is_a?(Proc)

      normalize_style_definition
      initialize_storage
```

Then scroll down, in the the same file, to about line 113 where there’s a method named ‘path’(def path style = nil #:nodoc:). Under that method we are going to make a new one.

```ruby
    def path style = nil #:nodoc:
      original_filename.nil? ? nil : interpolate(@path, style)
    end

    #Added this for background uploading.<br />    #This returns the path to the attachment in the s3 bucket.
    def path_s3 style = nil
      original_filename.nil? ? nil : interpolate(@path_s3, style)
    end
```

This will let us define a new key value(:path_s3) in the has_attached_file hash in the User model. If you’re wondering what the ‘path_s3’ does, it determines the path within the Amazon S3 Bucket that the file gets saved to and by having it in our has_attached_file options, we can change this if we need to later on. Which I’ll show you next.

Back to the User model, we add a new line in the has_attached_file hash:

```ruby
has_attached_file   :avatar,
                    :styles => { :large => "800x800&>", :medium => "300x300&>", :thumb => "100x100#", :tiny => "50x50#", :really_tiny => "25x25#"},
                    :storage => :filesystem,
                    :url => "http://s3.amazonaws.com/webapps3bucketname/:attachment/:id/:style/:basename.:extension",
                    :path => "tmp/paperclip_uploads/:attachment/:id/:style/:basename.:extension",
                    :path_s3 => ":attachment/:id/:style/:basename.:extension"
```

Don’t forget to restart the server since the Paperclip plugin was modified and also restart workling to generate the new workling we created earlier.

The last part is to call the worker through Starling. In this example, the file upload is being handled normally through the User controller and the Update action.

```ruby
def update
  @user.attributes = params[:user]
  #only set the processing_upload to true if an avatar file was uploaded
  #if the file doesn't pass valiations, @user wont get saved and processing_upload stays false
  @user.processing_upload = true if params[:user][:avatar]
  if @user.save
    flash[:notice] = "Your profile was successfully updated!"
    #tell starling to start the background worker only if processing_upload is true
    #the id of the user gets passed to let our worker know which files to upload
    PaperclipBackgroundUploadWorker.async_upload_to_amazon_s3(:id => @user.id) if @user.processing_upload
    #redirect to the edit page
    redirect_to edit_user_path
  else
    #save failed
    redirect_to :action => 'edit'
    flash[:notice] = "Something went wrong while trying to update your profile."
  end
end
```

That’s it! The next step is to create a way to let your users know that the file is being processed. All you have to do is check if processing_upload = true.

This is my first tutorial type of post so bear with me if I missed anything and please let me know asap! Also if you have any experience doing something similar to this, let me know!