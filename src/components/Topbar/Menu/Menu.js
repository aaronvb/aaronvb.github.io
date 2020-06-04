// @flow strict
import React from 'react';
import styles from './Menu.module.scss';

type Props = {
  menu: {
    label: string,
    path: string
  }[]
};

const Menu = ({ menu }: Props) => (
  <nav className={styles['menu']}>
      {menu.map((item) => (
          <a
            key={item.path}
            href={`/${item.path}`}
            className={styles['menu__list-item-link']}
          >
            {item.label}
          </a>
      ))}
  </nav>
);

export default Menu;
