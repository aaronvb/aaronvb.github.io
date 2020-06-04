// @flow strict
import React from 'react';
import { Link } from 'gatsby';
import styles from './Author.module.scss';

type Props = {
  author: {
    name: string,
  }
};

const Author = ({ author }: Props) => (
  <div className={styles['author']}>
    <span className={styles['author__title']}>
      <Link className={styles['author__title-link']} to="/">{author.name}</Link>
    </span>
  </div>
);

export default Author;
