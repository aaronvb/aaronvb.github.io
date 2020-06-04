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
        group(field: frontmatter___tags) {
          fieldValue
          totalCount
        }
      }
    }
  `);

  _.each(result.data.allMarkdownRemark.group, (tag) => {
    const tagSlug = `/tag/${_.kebabCase(tag.fieldValue)}`;

    createPage({
      path: tagSlug,
      component: path.resolve('./src/templates/tag-template.js'),
      context: {
        tag: tag.fieldValue,
      }
    });
  });
};
