// @flow strict
import React from 'react';
import Contacts from './Contacts';
import styles from './About.module.scss';
import { useSiteMetadata } from '../../hooks';

type Props = {
  body: string,
}

const About = ({ body }: Props) => {
  const { author } = useSiteMetadata();
  return (
    <div className={styles['about']}>
      <div className={styles['about__inner']}>
        <div className={styles['about__body']} dangerouslySetInnerHTML={{ __html: body }} />
        <Contacts contacts={author.contacts} />
      </div>
    </div>
  );
};

export default About;