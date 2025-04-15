import { QuestionCircleOutlined } from '@ant-design/icons';
import { SelectLang as UmiSelectLang } from '@umijs/max';
import React from 'react';

export type SiderTheme = 'light' | 'dark';

// 导出一个名为SelectLang的函数组件
export const SelectLang = () => {
  // 返回一个UmiSelectLang组件，并设置其样式为padding为4
  return (
    <UmiSelectLang
      style={{
        padding: 4,
      }}
    />
  );
};

// 导出一个名为Question的函数组件
export const Question = () => {
  // 返回一个div元素，包含一个QuestionCircleOutlined图标，点击时打开https://pro.ant.design/docs/getting-started链接
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://pro.ant.design/docs/getting-started');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};
