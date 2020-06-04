'use strict';

module.exports = {
  index: {
    edges: [
      {
        node: {
          fields: {
            slug: '/test_0',
            categorySlug: '/test'
          },
          frontmatter: {
            date: '2016-09-01',
            description: 'test_0',
            category: 'test',
            title: 'test_0'
          }
        }
      },
      {
        node: {
          fields: {
            slug: '/test_1',
            categorySlug: '/test'
          },
          frontmatter: {
            date: '2016-09-01',
            description: 'test_1',
            category: 'test',
            title: 'test_1'
          }
        }
      }
    ]
  },
  about: {
    id: '1',
    html: 'about'
  },
  projects: {
    id: '2',
    html: 'projects'
  },
  contact: {
    id: '3',
    html: 'contact'
  }
};
