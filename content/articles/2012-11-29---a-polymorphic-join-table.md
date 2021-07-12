---
title: A Polymorphic Join Table
description: "Not your ordinary polymorphic association, but a polymoprhic join table for Ruby on Rails."
slug: "a-polymorphic-join-table"
comments: true
date: "2012-11-29"
template: "post"
draft: false
category: "Tutorial"
tags:
  - "Code"
  - "Ruby on Rails"
  - "Polymorphism"
---

Here's an interesting problem I ran into today.

Polymorphic associations in Ruby on Rails are actually quite easy to do, especially in Rails 3.2. If you need a refresher, there's a great screencast over at Railscasts, which does require a subscription which I highly highly recommend: [railscasts.com/episodes/154-polymorphic-association-revised](http://railscasts.com/episodes/154-polymorphic-association-revised).

However, my problem was a little different, and maybe a special case because I can't think of many applications this would apply to.

Say I have a Location and a Checkpoint, and the Location and Checkpoint can have notes, posted by Users. I would use a polymorphic association for the Notes to the Location and Checkpoint. But, I also want a single Note, to be posted to many Locations or Checkpoints, which for a single model-to-model relationship I could simply use a join table.

Example, two Locations which are near each other, maybe they're coordinates, could share a single Note describing the general area, and with the same Note model, one Note may describe multiple Checkpoints.

![example_1](../assets/polymorphic_join_table_example_1.jpg)

Solution: Make the join table polymorphic.

![example_2](../assets/polymorphic_join_table_example_2.jpg)

Notes model that contains the content and user_id, which I use to associate the User model with.

```ruby
class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.text :content
      t.integer :user_id
      t.timestamps
    end
  end
end
```

Note join model that is also polymorphic. notable_id and notable_type is the polymorphic attributes used by ActiveRecord.

```ruby
class CreateNoteJoins < ActiveRecord::Migration
  def change
    create_table :note_joins do |t|
      t.integer :note_id
      t.integer :notable_id
      t.string  :notable_type
      t.timestamps
    end
    add_index :note_joins, [:notable_id, :notable_type]
  end
end
```

Next I add the model associations to Location and Checkpoint models.

```ruby
class Location < ActiveRecord::Base
  has_many :note_joins, as: :notable
  has_many :notes, through: :note_joins
end
```

```ruby
class Checkpoint < ActiveRecord::Base
  has_many :note_joins, as: :notable
  has_many :notes, through: :note_joins
end
```

Above I set the note_joins model as the polymorphic association :notable, which will use the notable_id and notable_type attributes to assign which model and ID the note join belongs to. Then I set the has_many association on the Note model, through note_joins. This will let me use such methods as Location.first.notes to pull up all the notes that belong to that location. The same applies to Checkpoint.

In the NoteJoin model I need specify that it belongs to the notable polymorphic association and that it also belongs to a Note. I do so by adding the following.

```ruby
class NoteJoin < ActiveRecord::Base
  belongs_to :notable, polymorphic: true
  belongs_to :note
end
```

Now for the Note model, it should belong to the notable polymorphic association, and also belong to a user(through the user_id attribute).

```ruby
class Note < ActiveRecord::Base
  attr_accessible :content, :user_id
  belongs_to :notable, polymorphic: true
  belongs_to :user

  has_many :note_joins
end
```

At this point everything should work, and through the NoteJoin model I can have a single Note belong to many different Locations and even Checkpoints.

Let's quickly test this in console.

```ruby
> Location.first.notes.create(user_id: 1, content: "foobar")
 => #< Note id: 1, content: "foobar", user_id: 1, created_at: "2012-11-30 02:19:24", updated_at: "2012-11-30 02:19:24" >
> Location.first.notes
 => [#< Note id: 1, content: "foobar", user_id: 1, created_at: "2012-11-30 02:19:24", updated_at: "2012-11-30 02:19:24" >]
```

Great it works, but now I want to see what Locations or Checkpoints this Note belongs to through NoteJoin. To do that I need to update my Note model to include a has_many locations and checkpoints. Notice I'm using the source and source_type option, to pass my polymorphic association :notable, since that's how we translate which model it belongs to.

<script src="https://gist.github.com/4173290.js?file=revised_note.rb"></script>

And now I can find the locations which my note belongs to.

```ruby
> Note.first.locations
 => [#< Location id: 1, name: "foobar", created_at: "2012-11-30 02:19:24", updated_at: "2012-11-30 02:19:24" >]
```

Another problem came up after this point. If I were to create a Note, how could I easily add many Locations to it? My first thought was to create a method that would update the join table, but I knew there had to be an easier way already built in ActiveRecord to do this.

I did some digging around and found a simple solution:

```ruby
> note = Note.create(user_id: 1, content: "foobar2")
 => #< Note id: 2, content: "foobar2", user_id: 1, created_at: "2012-11-30 02:19:24", updated_at: "2012-11-30 02:19:24" >
> Location.all.each do |location|
     note.locations << location
   end
```

I'm using << to push location objects into the note.locations array, and ActiveRecord will handle the creation of the NoteJoin record. Pretty neat.
