// @flow strict
import React from 'react';
import renderer from 'react-test-renderer';
import Articles from './Articles';

describe('Articles', () => {
  const props = {
    children: 'test',
    title: 'test',
  };

  it('renders correctly', () => {
    const tree = renderer.create(<Articles {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
