'use strict';

const path = require('path');

module.exports = async (graphql, actions) => {
  const { createPage } = actions;

  createPage({
    path: '/',
    component: path.resolve('./src/templates/index-template.js'),
  });
};
