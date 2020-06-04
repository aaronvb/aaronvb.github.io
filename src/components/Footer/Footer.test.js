// @flow strict
import React from 'react';
import renderer from 'react-test-renderer';
import { useStaticQuery, StaticQuery } from 'gatsby';
import MockDate from 'mockdate';
import Footer from './Footer';
import siteMetadata from '../../../jest/__fixtures__/site-metadata';
import type { RenderCallback } from '../../types';

describe('Tobar', () => {
  beforeEach(() => {
    StaticQuery.mockImplementationOnce(
      ({ render }: RenderCallback) => (
        render(siteMetadata)
      ),
      useStaticQuery.mockReturnValue(siteMetadata)
    );
  });

  const props = {
    isIndex: true
  };

  it('renders correctly', () => {
    MockDate.set(new Date('2020-04-30T11:01:58.135Z'));
    const tree = renderer.create(<Footer {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
    MockDate.reset();
  });
});
