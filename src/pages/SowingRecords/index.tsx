import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message, Modal } from 'antd';
import { ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useRef } from 'react';
import type { ActionType } from '@ant-design/pro-components';

interface SowingRecord {
  key: string;
  code: string;
  seedNumber: string;
  varietyName: string;
  sowingCount: number;
  planNumber: string;
  createTime: string;
}

const SowingRecords: React.FC = () => {
  const [sowingList, setSowingList] = useState<SowingRecord[]>([]);
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 加载数据的函数
  const loadSowingRecords = () => {
    const records = localStorage.getItem('sowingRecords');
    if (records) {
      try {
        const parsedRecords = JSON.parse(records);
        // 过滤掉无效的记录
        const validRecords = parsedRecords.filter((record: SowingRecord) => 
          record && 
          record.code && 
          record.seedNumber && 
          record.varietyName
        );
        setSowingList(validRecords);
      } catch (error) {
        console.error('Error parsing sowing records:', error);
        setSowingList([]);
      }
    } else {
      setSowingList([]);
    }
  };

  useEffect(() => {
    loadSowingRecords();
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
    URL.revokeObjectURL(url);
  };

  // 处理单个删除
  const handleDelete = (record: SowingRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除种植编号为 ${record.seedNumber} 的记录吗？`,
      onOk: async () => {
        try {
          const newRecords = sowingList.filter(item => item.key !== record.key);
          localStorage.setItem('sowingRecords', JSON.stringify(newRecords));
          setSowingList(newRecords);
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: async () => {
        try {
          const newRecords = sowingList.filter(
            item => !selectedRowKeys.includes(item.key)
          );
          localStorage.setItem('sowingRecords', JSON.stringify(newRecords));
          setSowingList(newRecords);
          setSelectedRowKeys([]);
          message.success('批量删除成功');
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
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
      render: (text: string) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record: SowingRecord) => [
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        title: '播种计划表',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
          disabled={selectedRowKeys.length === 0}
        >
          批量删除
        </Button>
        <Button
          type="primary"
          icon={<ExportOutlined />}
          onClick={handleExport}
          style={{ marginLeft: 8 }}
          disabled={sowingList.length === 0}
        >
          导出
        </Button>
      </div>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        dataSource={sowingList}
        columns={columns}
        rowKey="key"
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
    </PageContainer>
  );
};

export default SowingRecords; 