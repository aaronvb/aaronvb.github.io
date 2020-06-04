// @flow strict
import React from 'react';
import Layout from '../components/Layout';
import Page from '../components/Page';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useSiteMetadata } from '../hooks';

const NotFoundTemplate = () => {
  const { title, subtitle } = useSiteMetadata();

  return (
    <Layout title={`Not Found - ${title}`} description={subtitle}>
      <Topbar />
      <Page title="NOT FOUND">
        <p>Sorry, the content you are trying to find is not here.</p>
        <p>If you feel like there should be something here, please <a href="/#contact">contact me</a>.</p>
      </Page>
      <Footer />
    </Layout>
  );
};

export default NotFoundTemplate;
