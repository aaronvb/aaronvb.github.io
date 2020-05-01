// @flow strict
import React from 'react';
import renderer from 'react-test-renderer';
import { useStaticQuery, StaticQuery } from 'gatsby';
import MockDate from 'mockdate';
import CategoryTemplate from './category-template';
import siteMetadata from '../../jest/__fixtures__/site-metadata';
import allMarkdownRemark from '../../jest/__fixtures__/all-markdown-remark';
import pageContext from '../../jest/__fixtures__/page-context';
import type { RenderCallback } from '../types';

describe('CategoryTemplate', () => {
  const props = {
    data: {
      ...allMarkdownRemark
    },
    ...pageContext
  };

  beforeEach(() => {
    StaticQuery.mockImplementationOnce(
      ({ render }: RenderCallback) => (
        render(siteMetadata)
      ),
      useStaticQuery.mockReturnValue(siteMetadata)
    );
  });

  it('renders correctly', () => {
    MockDate.set(new Date('2020-04-30T11:01:58.135Z'));
    const tree = renderer.create(<CategoryTemplate {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
    MockDate.reset();
  });
});
