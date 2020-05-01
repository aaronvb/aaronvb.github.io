// @flow strict
import React from 'react';
import renderer from 'react-test-renderer';
import MockDate from 'mockdate';
import Daily from './Daily';

describe('Daily', () => {
  it('renders correctly', () => {
    MockDate.set('2020-04-30');
    const tree = renderer.create(<Daily />).toJSON();
    expect(tree).toMatchSnapshot();
    MockDate.reset();
  });
});
