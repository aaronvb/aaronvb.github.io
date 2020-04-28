---
title: Chaining API requests with redux-thunk
date: "2018-02-7"
template: "post"
comments: true
description: "I recently came upon a simple problem where I couldn’t find an easy solution to, on the Google or SO. However, I did find the parts to the answer, and put them together to get this working."
slug: "chaining-api-requests-with-redux-thunk"
category: "Open Source"
tags:
  - "Code"
  - "JavaScript"
  - "React"
  - "Redux"
  - "Thunk"
---

I recently came upon a simple problem where I couldn’t find an easy solution to, on the Google or SO. However, I did find the parts to the answer, and put them together to get this working.

My problem was finding a way to chain API requests using redux-thunk and axios. My use case was to gather an array of objects(containing id’s) on the first API request, and then subsequently gather each individual objects’ data from the array above, using the id, through another API request, all asynchronously.

![thunk_example](../assets/thunk_example.gif)

I was able to solve this in redux-thunk by making two actions; one to fetch all, and one to fetch each individually. And, to chain them together, we treat each action as a promise(they return axios promises), then let redux-thunk do it’s magic. To get the array of objects in the first API request, we can use getState() from the first promise.

```javascript
export const requestIssuesAndIssueData = () => {
  return (dispatch, getState) => {
    dispatch(requestIssues()).then(() => {
      const issuesArr = getState().issues.issuesById;
      issuesArr.forEach(issue => {
        dispatch(requestIssueCommentsHash(issue.number));
      });
    });
  };
};
```

In the snippet above I am using GitHub issues as an example.

To see the entire example, checkout my repo at https://github.com/aaronvb/redux-thunk-chain-api-requests.

To see it in action I setup a demo project at https://aaronvb.github.io/redux-thunk-chain-api-requests.

Happy hacking!