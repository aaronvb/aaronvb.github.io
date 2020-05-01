// @flow strict
import React from 'react';
import renderer from 'react-test-renderer';
import Daily from './Daily';

describe('Daily', () => {
  it('renders correctly', () => {
    const props = {
      dayOfWeek: 4
    };

    const tree = renderer.create(<Daily {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
