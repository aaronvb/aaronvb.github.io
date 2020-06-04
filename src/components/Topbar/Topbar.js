// @flow strict
import React from 'react';
import Author from './Author';
import Menu from './Menu';
import styles from './Topbar.module.scss';
import { useSiteMetadata } from '../../hooks';

const Topbar = () => {
  const { author, menu } = useSiteMetadata();

  return (
    <div className={styles['topbar']}>
      <div className={styles['topbar__inner']}>
        <Author author={author} />
        <Menu menu={menu} />
      </div>
    </div>
  );
};

export default Topbar;
