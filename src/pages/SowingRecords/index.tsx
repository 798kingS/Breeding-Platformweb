import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const SowingRecords: React.FC = () => {
  const [sowingList, setSowingList] = useState<any[]>([]);

  useEffect(() => {
    // 从localStorage加载播种记录
    const records = localStorage.getItem('sowingRecords');
    if (records) {
      setSowingList(JSON.parse(records));
    }
  }, []);

  const handleExport = () => {
    if (sowingList.length === 0) {
      message.warning('暂无播种记录');
      return;
    }

    // 创建CSV内容
    const headers = [
      '种植编号',
      '编号',
      '品种名称',
      '播种数量',
      '计划编号',
      '创建时间'
    ];

    const csvContent = [
      headers.join(','),
      ...sowingList.map(item => [
        item.code,
        item.seedNumber,
        item.varietyName,
        item.sowingCount,
        item.planNumber,
        item.createTime
      ].join(','))
    ].join('\n');

    // 创建并下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '考种记载表.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: '种植编号',
      dataIndex: 'code',
    },
    {
      title: '编号',
      dataIndex: 'seedNumber',
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
    },
    {
      title: '播种数量',
      dataIndex: 'sowingCount',
    },
    {
      title: '计划编号',
      dataIndex: 'planNumber',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '播种计划表',
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
        dataSource={sowingList}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </PageContainer>
  );
};

export default SowingRecords; 