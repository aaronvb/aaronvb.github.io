// @flow strict
import React from 'react';
import { Link } from 'gatsby';
import type { Edges } from '../../types';
import styles from './Feed.module.scss';

type Props = {
  edges: Edges
};

const Feed = ({ edges }: Props) => (
  <div className={styles['feed']}>
    {edges.map((edge) => {
      const parsedDate = new Date(edge.node.frontmatter.date);
      const dateTimeFormat = new Intl.DateTimeFormat('en',
        {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          timeZone: 'UTC'
        });

      const [
        { value: month },,
        { value: day },,
        { value: year }
      ] = dateTimeFormat.formatToParts(parsedDate);

      return (
        <div className={styles['feed__item']} key={edge.node.fields.slug}>
          <div className={styles['feed__item-meta']}>
            <time className={styles['feed__item-meta-time']} dateTime={`${month} ${day}, ${year}`}>
              {month} {year}
            </time>
            <div className={styles['feed__item-inner']}>
              <span className={styles['feed__item-title']}>
                <Link className={styles['feed__item-title-link']} to={edge.node.fields.slug}>{edge.node.frontmatter.title}</Link>
              </span>
              <span className={styles['feed__item-meta-divider']} />
              <span className={styles['feed__item-meta-category']}>
                <Link to={edge.node.fields.categorySlug} className={styles['feed__item-meta-category-link']}>{edge.node.frontmatter.category}</Link>
              </span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default Feed;
