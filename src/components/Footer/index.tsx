import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'Breeding Platform',
          title: 'Breeding Platform',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },

      ]}
    />
  );
};

export default Footer;
