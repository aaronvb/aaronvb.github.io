// @flow strict
import React from 'react';
import Copyright from './Copyright';
import Daily from './Daily';
import styles from './Footer.module.scss';
import { useSiteMetadata } from '../../hooks';

const Footer = () => {
  const { copyright } = useSiteMetadata();

  return (
    <div className={styles['footer']}>
      <div className={styles['footer__inner']}>
        <div className={styles['footer__copyright']}>
          <Copyright copyright={copyright} />
        </div>
        <div className={styles['footer__daily']}>
          <Daily />
        </div>
      </div>
    </div>
  );
};

export default Footer;
