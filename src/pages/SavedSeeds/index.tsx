import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const SavedSeeds: React.FC = () => {
  const [savedSeedList, setSavedSeedList] = useState<any[]>([]);

  useEffect(() => {
    // 从localStorage加载留种记录
    const records = localStorage.getItem('savedSeeds');
    if (records) {
      setSavedSeedList(JSON.parse(records));
    }
  }, []);

  const handleExport = () => {
    if (savedSeedList.length === 0) {
      message.warning('暂无留种记录');
      return;
    }

    // 创建CSV内容
    const headers = [
      '品种名称',
      '类型',
      '留种编号',
      '引种年份',
      '来源',
      '常规种/纯化',
      '种植年份',
      '抗性',
      '结果特征',
      '开花期/果实发育期',
      '留果个数',
      '产量',
      '果型',
      '皮色',
      '肉色',
      '单果重(g)',
      '肉厚(mm)',
      '糖度(°Brix)',
      '质地',
      '总体口感',
      '配合力'
    ];

    const csvContent = [
      headers.join(','),
      ...savedSeedList.map(item => [
        item.varietyName || '',
        item.type || '',
        item.seedNumber || '',
        item.introductionYear || '',
        item.source || '',
        item.breedingType || '',
        item.plantingYear || '',
        item.resistance || '',
        item.fruitCharacteristics || '',
        item.floweringPeriod || '',
        item.fruitCount || '',
        item.yield || '',
        item.fruitShape || '',
        item.skinColor || '',
        item.fleshColor || '',
        item.singleFruitWeight || '',
        item.fleshThickness || '',
        item.sugarContent || '',
        item.texture || '',
        item.overallTaste || '',
        item.combiningAbility || ''
      ].join(','))
    ].join('\n');

    // 创建并下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '留种记录.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: '品种名称',
      dataIndex: 'varietyName',
    },
    {
      title: '类型',
      dataIndex: 'type',
    },
    {
      title: '留种编号',
      dataIndex: 'seedNumber',
    },
    {
      title: '引种年份',
      dataIndex: 'introductionYear',
    },
    {
      title: '来源',
      dataIndex: 'source',
    },
    {
      title: '常规种/纯化',
      dataIndex: 'breedingType',
      render: (text: string) => text === 'regular' ? '常规种' : '纯化',
    },
    {
      title: '种植年份',
      dataIndex: 'plantingYear',
    },
    {
      title: '抗性',
      dataIndex: 'resistance',
    },
    {
      title: '结果特征',
      dataIndex: 'fruitCharacteristics',
    },
    {
      title: '开花期/果实发育期',
      dataIndex: 'floweringPeriod',
    },
    {
      title: '留果个数',
      dataIndex: 'fruitCount',
    },
    {
      title: '产量',
      dataIndex: 'yield',
    },
    {
      title: '果型',
      dataIndex: 'fruitShape',
    },
    {
      title: '皮色',
      dataIndex: 'skinColor',
    },
    {
      title: '肉色',
      dataIndex: 'fleshColor',
    },
    {
      title: '单果重(g)',
      dataIndex: 'singleFruitWeight',
    },
    {
      title: '肉厚(mm)',
      dataIndex: 'fleshThickness',
    },
    {
      title: '糖度(°Brix)',
      dataIndex: 'sugarContent',
    },
    {
      title: '质地',
      dataIndex: 'texture',
    },
    {
      title: '总体口感',
      dataIndex: 'overallTaste',
    },
    {
      title: '配合力',
      dataIndex: 'combiningAbility',
    },
  ];

  return (
    <PageContainer
      header={{
        title: '留种记录',
        extra: [
          <Button
            key="export"
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出记录
          </Button>,
        ],
      }}
    >
      <Table
        columns={columns}
        dataSource={savedSeedList}
        rowKey="key"
        scroll={{ x: 2000 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </PageContainer>
  );
};

export default SavedSeeds; 