---
title: Selection Sort in Ruby
description: "Implementing Selection Sort in Ruby"
comments: true
date: "2014-11-01"
template: "post"
draft: false
slug: "selection-sort-in-ruby"
category: "Learn"
tags:
  - "Code"
  - "Ruby"
  - "Algorithms"
---

In my version of Selection Sort in Ruby, I start with the first object in the array and compare it to the next one and so on until I find lowest value, swapping it with the first objects position. I then repeat that on the second object, and the next, until the whole list is sorted.

Here's an [animated sequence](https://en.wikipedia.org/wiki/File:Selection-Sort-Animation.gif) of Selection Sort that I found on the [Selection Sort Wikipedia](https://en.wikipedia.org/wiki/Selection_sort).

As always, start with the tests.

```ruby
require 'test/unit'
require "./selection_sort.rb"

class SortingTests < Test::Unit::TestCase
  def test_selection_sort
    @unsorted = (0..1000).to_a.shuffle
    @sorted = @unsorted.sort
    selection_sort = SelectionSort.new
    result = selection_sort.sort(@unsorted)
    assert_equal @sorted, result
  end
end
```

And next, the Selection Sort function.

```ruby
class SelectionSort
  def sort(to_sort)
    arr_to_sort = to_sort
    length_of_sort = arr_to_sort.length
    position_in_array = 0
    while position_in_array < length_of_sort
      @min_val = arr_to_sort[position_in_array]
      (length_of_sort - position_in_array).times.each do |i|
        if arr_to_sort[position_in_array + i] < @min_val
          @min_val = arr_to_sort[position_in_array + i]
          @min_val_index = position_in_array + i
        end
      end
      if @min_val < arr_to_sort[position_in_array]
        @swap_value = arr_to_sort[position_in_array]
        arr_to_sort.delete_at(@min_val_index)
        arr_to_sort.insert(position_in_array, @min_val)
        arr_to_sort.delete_at(position_in_array+1)
        arr_to_sort.insert(@min_val_index, @swap_value)
      end
      position_in_array += 1
    end
    return arr_to_sort
  end
end
```
