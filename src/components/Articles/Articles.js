import React from 'react';
import styles from './Articles.module.scss';

type Props = {
  children: React.Node
};

const Articles = ({ children }: Props) => (
  <div className={styles['articles']}>
    <div className={styles['articles__inner']}>
      <h4 href="#articles" id="articles">Articles</h4>
      <div className={styles['articles__body']}>
        {children}
      </div>
    </div>
  </div>
);

export default Articles;