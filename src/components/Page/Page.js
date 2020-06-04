import React from 'react';
import styles from './Page.module.scss';

type Props = {
  title?: string,
  children: React.Node
};

const Page = ({ title, children }: Props) => (
  <div className={styles['page']}>
    <div className={styles['page__inner']}>
      { title && <h4 className={styles['page__title']}>{title}</h4>}
      <div className={styles['page__body']}>
        {children}
      </div>
    </div>
  </div>
);

export default Page;