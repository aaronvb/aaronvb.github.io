// @flow strict
import React from 'react';
import renderer from 'react-test-renderer';
import { useStaticQuery, StaticQuery } from 'gatsby';
import NotFoundTemplate from './not-found-template';
import siteMetadata from '../../jest/__fixtures__/site-metadata';
import type { RenderCallback } from '../types';
import MockDate from 'mockdate';

describe('NotFoundTemplate', () => {
  beforeEach(() => {
    StaticQuery.mockImplementationOnce(
      ({ render }: RenderCallback) => (
        render(siteMetadata)
      ),
      useStaticQuery.mockReturnValue(siteMetadata)
    );
  });

  it('renders correctly', () => {
    MockDate.set('2020-04-30')
    const tree = renderer.create(<NotFoundTemplate />).toJSON();
    expect(tree).toMatchSnapshot();
    MockDate.reset();
  });
});
