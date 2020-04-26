---
title: Intro to Elasticsearch and Ruby on Rails, Part 1
comments: true
description: "An introduction to Elasticsearch and Ruby on Rails 4: searching, associations, and method values."
date: "2014-10-17"
template: "post"
draft: false
slug: "intro-to-elasticsearch-ruby-on-rails-part-1"
category: "Open Source"
tags:
  - "Code"
  - "Elasticsearch"
  - "Ruby on Rails"
  - "Guide"
---

This will be a two-part guide on my first experiences with [Elasticsearch](https://www.elastic.co/) and Ruby on Rails 4. I've been a long time fan of [Solr](https://lucene.apache.org/solr/), and [Sunspot](https://sunspot.github.io/) with Ruby on Rails, as Sunspot has always been easy to implement without a big learning curve. There's also a lot of information out there for Sunspot.

Elasticsearch, on the other hand, seems to be less popular with Ruby on Rails. From my research, there were a few gems that were popular but are no longer active, and any google searches on information regarding them are dated at least a year back. It seems that the [go-to gem for Elasticsearch](https://github.com/elasticsearch/elasticsearch-rails) is now from Elasticsearch itself, which actually consist of 3 separate gems.

In the first part, I will setup a basic search using the default Elasticsearch config, while also configuring the search of ActiveRecord associations and indexing a value obtained by a method. In the second part I will cover more advanced searches using custom analyzers and filters, such as ngram, edgengram, and lowercase filters on specific columns.

To get started, grab the latest Ruby on Rails, which at the time of this post is 4.1.6, and add these gems to your Gemfile. Notice we are only using two of the gems.

```ruby
gem 'elasticsearch-model',
  git: 'git://github.com/elasticsearch/elasticsearch-rails.git'
gem 'elasticsearch-rails',
  git: 'git://github.com/elasticsearch/elasticsearch-rails.git'
```

Some information on the two gems we are using taken from their Github repo:

* elasticsearch-model, which contains search integration for Ruby/Rails models such as ActiveRecord::Base and Mongoid
* elasticsearch-rails, which contains various features for Ruby on Rails applications.

We don't need to use elasticsearch-persistence because elasticsearch-model will handle everything we need in our Ruby on Rails app.

The easiest way to install Elasticsearch is by using [Homebrew](https://brew.sh/), which I hope you are already using.

```console
> brew install elasticsearch
> elasticsearch --config=/usr/local/opt/elasticsearch/config/elasticsearch.yml
```

By default, our Rails app will connect to Elasticsearch at localhost:9200, but if you need to connect to a different server, create a .rb file in your config/initializers and add this.

```ruby
# config/initializers/elasticsearch.rb
# ENV['ELASTICSEARCH_ADDRESS_INT'] is the environment variable
# for the elasticsearch server, replace with IP address if not using ENV
User.__elasticsearch__.client = Elasticsearch::Client.new host: ENV['ELASTICSEARCH_ADDRESS_INT']
```

Alright, so if you haven't already figured it out from the code above, we're going to be searching a *User* model. Create a User table if you don't already have one, and make sure it has a first name and email column.

```console
> rails g model user first_name:string email:string
> rake db:migrate
```

Open the model file at *app/models/user.rb*, and add the Elasticsearch includes. This will allow us to use the Elasticsearch methods on our model, and will also enable the Elasticsearch callbacks for events such as creating, updating, and destroying our model objects, which will keep the Elasticsearch index up to date.

```ruby
class User < ActiveRecord::Base
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
end
```

That's pretty much all you need to do to start searching the User model. By default this will search all the columns in this model. Open up the rails console to see how easy it is.

```console
> rails c
Loading development environment (Rails 4.1.6)
irb(main):001:0> User.import
=> 0
irb(main):001:0> User.search("aaron").results.count
=> 10
```

One thing you'll notice is the *import* method that I'm calling on the User model. This is needed because our search index is empty and we need to populate it with our current data. Any subsequent changes to the User table will automatically be added to the index by the Elasticsearch callbacks, so you wont need to run the import method again, unless changes are made outside of the Rails app.

If you read up on the documentation, you'll be able to do some neat things like find the score each result. One thing I want to mention is that if you use the *records* method instead of the *results* method, you will get a collection of ActiveRecord objects instead of Elasticsearch objects.

```console
irb(main):001:0> User.search("aaron").results.first
=> #<Elasticsearch::Model::Response::Result:0x007fd200e71380 @result=#<Hashie::Mash _id="155" _index="users" _score=0.5878618...
> User.search("aaron").results.first._score
=> 0.5878618
> User.search("aaron").records.first
=> #<User id: 155, first_name: "aaron", email: "bokhoven@gmail.com"...
```

Cool, so now we can search our User table. But what if we have associations that need to be searched as well? Elasticsearch has a model function for that. Let's start by creating our association model: PhoneNumber, and adding the associations to our models.

```console
> rails g model phone_number number:string user_id:integer
> rake db:migrate
```

```ruby
class PhoneNumber < ActiveRecord::Base
  belongs_to :user
end
```

```ruby
class User < ActiveRecord::Base
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  has_many :phone_numbers
end
```

Now we need to configure how Elasticsearch creates the index document for each object. In our *User* model add this function.

```ruby
class User < ActiveRecord::Base
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  has_many :phone_numbers

  def as_indexed_json(options={})
    as_json(
      only: [:id, :first_name, :email],
      include: [:phone_numbers]
    )
  end
end
```

I'll explain what's going on here. When Elasticsearch indexes our User object, we are telling it that we only want to search the id, first name, and email attribute, and all phone numbers associated with this object. To better visualize what the document looks like, open up the rails console.

```console
> rails c
irb(main):001:0> User.first.as_indexed_json
=> {"id"=>1, "email"=>"bokhoven@gmail.com", "first_name"=>"aaron",
  "phone_numbers"=>[{"id"=>1, "user_id"=>1, "number"=>"123-456-7890"}]}]}
```

Note, when we search for a Phone Number, we aren't searching a separate phone number index, we are still searching our User index that has a collection of phone numbers.

> Elasticsearch, like most NoSQL databases, treats the world as though it were flat. An index is a flat collection of independent documents. A single document should contain all of the information that is required to decide whether it matches a search request or not.
> - [Elasticsearch Relations](https://www.elastic.co/guide/en/elasticsearch/guide/current/relations.html)

To create a separate Phone Number index and have Elasticsearch emulate the association, look into [Nested Objects](https://www.elastic.co/guide/en/elasticsearch/guide/current/nested-objects.html). While both have their advantages and disadvantages, sticking with the flat document will work well most of the time. Possibly in another article I will go over Nested Objects.

Let's rebuilt and test our new search index.

```console
irb(main):001:0> User.import
=> 0
> query = User.search("123-456-7890").records.first
=> #<User id: 155, first_name: "aaron", email: "bokhoven@gmail.com"...
> query.phone_numbers.first
=> #<ActiveRecord::Associations::CollectionProxy [#<PhoneNumber id: 1, user_id: 155, number: "123-456-7890">]>
```

Easy, everything works. Not quite. When using associations, it's not a good idea to use the *records* method on the search object. The reason for this is because the collection of records from the search object are ActiveRecord objects, and using the phone numbers method on it will cause ActiveRecord to look up each phone number object for each search record. What you want to use is the *results* method on the search object, this will use the "flat" document and not create any more queries for the phone numbers as they are included in the results object. To make this clearer, I'll show you an example.

This is with records.

```console
irb(main):001:0> User.search("aaron").records.first
  User Search (10.1ms) {index: "users", type: "user", q: "aaron"}
  User Load (3.0ms)  SELECT "users".* FROM "users"  WHERE "users"."id" IN (155, 156, 157, 158)
=> #<User id: 155, first_name: "aaron", email: "bokhoven@gmail.com"...

> User.search("aaron").records.first.phone_numbers
  User Search (10.1ms) {index: "users", type: "user", q: "aaron"}
  User Load (3.0ms)  SELECT "users".* FROM "users"  WHERE "users"."id" IN (155, 156, 157, 158)
  PhoneNumber Load (2.9ms)  SELECT "phone_numbers".* FROM "phone_numbers"  WHERE "phone_numbers"."user_id" = $1  [["user_id", 155]]
=> #<ActiveRecord::Associations::CollectionProxy [#<PhoneNumber id: 1, user_id: 155, number: "123-456-7890"...
```

You can see that another call was made to the PhoneNumber model because we're calling the phone_numbers method on the User ActiveRecord object which was in the *records* collection.

This is with results.

```console
irb(main):001:0> User.search("aaron").results.first
  User Search (10.1ms) {index: "users", type: "user", q: "aaron"}
=> #<Hashie::Mash id: 155, first_name: "aaron", email: "bokhoven@gmail.com"...

> User.search("aaron").records.first.phone_numbers
  User Search (10.1ms) {index: "users", type: "user", q: "aaron"}
=> #<Hashie::Mash id: 155, first_name: "aaron", email: "bokhoven@gmail.com", phone_numbers=[#<Hashie::Mash number="123-456-7890"...
```

With that said, let's move on to the last topic I wanted to cover, adding values to the search document that are created by a method in the model. An example of this could be a *full name* method that returns a first and last name column together. It makes more sense to search the full name value instead of both columns separately. We'll use that example in our app.

```console
> rails g migration add_last_name_to_users last_name:string
> rake db:migrate
```

```ruby
class User < ActiveRecord::Base
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  has_many :phone_numbers

  def full_name
    "#{first_name} #{last_name}"
  end

  def as_indexed_json(options={})
    as_json(
      only: [:id, :full_name, :email],
      include: [:phone_numbers],
      methods: [:full_name]
    )
  end
end
```

I added the *full_name* method to our User model, and then modified the as\_indexed\_json method to include the full\_name method, and also added it to the document by including it in the *only* collection. You can always double check what the document looks like by calling the the as\_indexed\_json method on a User model, I explained how earlier in this article.

```console
irb(main):001:0> User.search("aaron van bokhoven").results.first
=> #<Hashie::Mash id: 155, full_name: "aaron van bokhoven", email: "bokhoven@gmail.com"...
```

This is the end of the first part. Elasticsearch is a powerful tool and I've only just begun to scratch the surface. Stay tuned for my next part on customizing Elasicsearch to use analyzers and filters.
