// @flow strict
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Topbar from '../components/Topbar';
import About from '../components/About';
import Feed from '../components/Feed';
import Footer from '../components/Footer';
import Articles from '../components/Articles';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import { useSiteMetadata } from '../hooks';
import type { PageContext, IndexContext } from '../types';

type Props = {
  data: IndexContext,
  pageContext: PageContext
};

const IndexTemplate = ({ data }: Props) => {
  const { title: siteTitle, subtitle: siteSubtitle } = useSiteMetadata();

  const { edges } = data.index;
  const { html: aboutBody } = data.about;
  const { html: projectsBody } = data.projects;
  const { html: contactBody } = data.contact;
  const pageTitle = siteTitle;

  return (
    <Layout title={pageTitle} description={siteSubtitle}>
      <Topbar />
      <About body={aboutBody} />
      <Projects body={projectsBody} />
      <Articles>
        <Feed edges={edges} />
      </Articles>
      <Contact body={contactBody} />
      <Footer />
    </Layout>
  );
};

export const query = graphql`
  query {
    index: allMarkdownRemark(
        filter: { frontmatter: { template: { eq: "post" }, draft: { ne: true } } },
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
          }
        }
      }
    }
    about: markdownRemark(fields: { slug: { eq: "/about/" } }) {
      id
      html
    }
    projects: markdownRemark(fields: { slug: { eq: "/projects/" } }) {
      id
      html
    }
    contact: markdownRemark(fields: { slug: { eq: "/contact/" } }) {
      id
      html
    }
  }
`;

export default IndexTemplate;
