---
title: Bubble Sort in Ruby
description: "Implementing Bubble Sort in Ruby"
comments: true
date: "2013-04-20"
template: "post"
draft: false
slug: "bubble-sort-in-ruby"
category: "Open Source"
tags:
  - "Code"
  - "Ruby"
  - "Algorithms"
---

Lately during my free time I've been reading through sorting algorithms for fun and decided to implement several in Ruby. I'll be posting each one in a separate article as I go through them.

Here's a [bubble sort](https://en.wikipedia.org/wiki/Bubble_sort) in Ruby.

Bubble sort is a pretty fun and easy sorting algorithm. For each pass through an array of values, each value is compared to its adjacent value and swapped into the correct order and so on. Worst case is O(n^2) and best case is O(n) if the array is already sorted.

Let's start with the test.

```ruby
require 'test/unit'
require "./bubble_sort.rb"

class SortingTests < Test::Unit::TestCase
  def test_bubble_sort
    @unsorted = (0..1000).to_a.sort{ rand() - 0.5 }[0..1000] # 1000 random integers in an array
    @sorted = @unsorted.sort
    bubble_sort = BubbleSort.new
    result = bubble_sort.sort(@unsorted)
    assert_equal @sorted, result
  end
end
```

In the test I create an array of random numbers and assert_equal to the result of the bubble sort.

Next the code for the bubble sort.

```ruby
class BubbleSort
  def sort(to_sort)
    # move the array to sort into a variable, which will be used for recursion
    arr_to_sort = to_sort
    # assume that we haven't swapped any values yet
    swapped = false
    # lower the length by one because we can't compare the last value since it's at the end
    length_of_sort = arr_to_sort.length - 1
    # begin loop through each value
    length_of_sort.times.each do |i|
      # if the value we're on is greater than the value to the left of it, swap
      if arr_to_sort[i] > arr_to_sort[i+1]
        # store values to be swapped
        a,b = arr_to_sort[i],arr_to_sort[i+1]
        # remove value we're on
        arr_to_sort.delete_at(i)
        # insert the value to the right, moving the lesser value to the left
        arr_to_sort.insert(i+1, a)
        # swap is true since we did a swap during this pass
        swapped = true
      end
    end
    if swapped == false
      # no swaps, return sorted array
      return arr_to_sort
    else
      # swaps were true, pass array to sort method
      bubble_sort = BubbleSort.new
      bubble_sort.sort(arr_to_sort)
    end
  end
end
```

I use recursion for each pass until swapped is equal to false, which means that the array is sorted.