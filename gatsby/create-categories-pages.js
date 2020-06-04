'use strict';

const _ = require('lodash');
const path = require('path');

module.exports = async (graphql, actions) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allMarkdownRemark(
        filter: { frontmatter: { template: { eq: "post" }, draft: { ne: true } } }
      ) {
        group(field: frontmatter___category) {
          fieldValue
          totalCount
        }
      }
    }
  `);

  _.each(result.data.allMarkdownRemark.group, (category) => {
    const categorySlug = `/category/${_.kebabCase(category.fieldValue)}`;

    createPage({
      path: categorySlug,
      component: path.resolve('./src/templates/category-template.js'),
      context: {
        category: category.fieldValue,
      }
    });
  });
};
