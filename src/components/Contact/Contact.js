// @flow strict
import React from 'react';
import styles from './Contact.module.scss';

type Props = {
  body: string,
}

const Contact = ({ body }: Props) => (
  <div className={styles['contact']}>
    <div className={styles['contact__inner']}>
      <h4 className={styles['page__title']} href="#contact" id="contact">Contact</h4>
      <div className={styles['contact__body']} dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  </div>
);

export default Contact;