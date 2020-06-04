// @flow strict
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Feed from '../components/Feed';
import Page from '../components/Page';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useSiteMetadata } from '../hooks';
import type { AllMarkdownRemark, PageContext } from '../types';

type Props = {
  data: AllMarkdownRemark,
  pageContext: PageContext
};

const TagTemplate = ({ data, pageContext }: Props) => {
  const { title: siteTitle, subtitle: siteSubtitle } = useSiteMetadata();

  const {
    tag,
  } = pageContext;

  const { edges } = data.allMarkdownRemark;
  const pageTitle = `All Posts tagged as "${tag}" - ${siteTitle}`;
  const title = `Articles tagged with ${tag}`;

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
  query TagPage($tag: String) {
    site {
      siteMetadata {
        title
        subtitle
      }
    }
    allMarkdownRemark(
        filter: { frontmatter: { tags: { in: [$tag] }, template: { eq: "post" }, draft: { ne: true } } },
        sort: { order: DESC, fields: [frontmatter___date] }
      ){
      edges {
        node {
          fields {
            slug
            categorySlug
          }
          frontmatter {
            title
            date
            category
            description
          }
        }
      }
    }
  }
`;

export default TagTemplate;
