// @flow strict
import React from 'react';
import styles from './Meta.module.scss';

type Props = {
  date: string
};

const Meta = ({ date }: Props) => {
  const parsedDate = new Date(date);
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
    <div className={styles['meta']}>
      <p className={styles['meta__date']}>Published {day} {month} {year}</p>
    </div>
  );
};

export default Meta;
