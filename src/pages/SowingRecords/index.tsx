import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message, Modal } from 'antd';
import { ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useRef } from 'react';
import type { ActionType } from '@ant-design/pro-components';

const SowingRecords: React.FC = () => {
  const [sowingList, setSowingList] = useState<any[]>([]);
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  // 处理单个删除
  const handleDelete = (record: API.RuleListItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除种植编号为 ${record.seedNumber} 的记录吗？`,
      onOk: async () => {
        try {
          // 从 localStorage 获取现有记录
          const existingRecords = localStorage.getItem('sowingRecords');
          if (existingRecords) {
            const records = JSON.parse(existingRecords);
            // 过滤掉要删除的记录
            const newRecords = records.filter((item: any) => item.key !== record.key);
            // 保存更新后的记录
            localStorage.setItem('sowingRecords', JSON.stringify(newRecords));
            
            message.success('删除成功');
            // 刷新表格
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
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
          // 从 localStorage 获取现有记录
          const existingRecords = localStorage.getItem('sowingRecords');
          if (existingRecords) {
            const records = JSON.parse(existingRecords);
            // 过滤掉要删除的记录
            const newRecords = records.filter(
              (item: any) => !selectedRowKeys.includes(item.key)
            );
            // 保存更新后的记录
            localStorage.setItem('sowingRecords', JSON.stringify(newRecords));
            
            setSelectedRowKeys([]);
            message.success('批量删除成功');
            // 刷新表格
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
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
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
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