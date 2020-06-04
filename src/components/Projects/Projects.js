// @flow strict
import React from 'react';
import styles from './Projects.module.scss';

type Props = {
  body: string,
}

const Projects = ({ body }: Props) => (
  <div className={styles['projects']}>
    <div className={styles['projects__inner']}>
      <h4 className={styles['page__title']} href="#projects" id="projects">Projects</h4>
      <div className={styles['projects__body']} dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  </div>
);

export default Projects;