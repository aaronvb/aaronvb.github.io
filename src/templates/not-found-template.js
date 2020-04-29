// @flow strict
import React from 'react';
import Sidebar from '../components/Sidebar';
import Layout from '../components/Layout';
import Page from '../components/Page';
import { useSiteMetadata } from '../hooks';

const NotFoundTemplate = () => {
  const { title, subtitle } = useSiteMetadata();

  return (
    <Layout title={`Not Found - ${title}`} description={subtitle}>
      <Sidebar />
      <Page title="NOT FOUND">
        <p>Sorry, the content you are trying to find is not here.</p>
        <p>If you feel like there should be something here, please <a href="/contact">contact me</a>.</p>
      </Page>
    </Layout>
  );
};

export default NotFoundTemplate;
