// @flow strict
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Feed from '../components/Feed';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import Page from '../components/Page';
import { useSiteMetadata } from '../hooks';
import type { PageContext, AllMarkdownRemark } from '../types';

type Props = {
  data: AllMarkdownRemark,
  pageContext: PageContext
};

const CategoryTemplate = ({ data, pageContext }: Props) => {
  const { title: siteTitle, subtitle: siteSubtitle } = useSiteMetadata();

  const {
    category,
  } = pageContext;

  const { edges } = data.allMarkdownRemark;
  const pageTitle = `${category} - ${siteTitle}`;
  const title = `Articles in the ${category} category`;

  return (
    <Layout title={pageTitle} description={siteSubtitle}>
      <Topbar />
      <Page title={title}>
        <Feed edges={edges} />
      </Page>
      <Footer />
    </Layout>
  );
};

export const query = graphql`
  query CategoryPage($category: String) {
    allMarkdownRemark(
        filter: { frontmatter: { category: { eq: $category }, template: { eq: "post" }, draft: { ne: true } } },
        sort: { order: DESC, fields: [frontmatter___date] }
      ){
      edges {
        node {
          fields {
            categorySlug
            slug
          }
          frontmatter {
            date
            description
            category
            title
          }
        }
      }
    }
  }
`;

export default CategoryTemplate;
