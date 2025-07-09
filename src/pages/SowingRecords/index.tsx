// 种质资源管理/播种计划表
import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message, Modal } from 'antd';
import { ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { deleteSowingRecord, batchDeleteSowingRecords } from '@/services/Breeding Platform/api';

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 加载数据的函数
  const loadSowingRecords = async () => {
    try {
      const response = await fetch('/api/seed/getSeedSow');
      if (!response.ok) throw new Error('网络错误');
      const result = await response.json();
      console.log('获取播种记录:', result);
      if (Array.isArray(result.data)) {
        // 保证每条数据的key唯一
        const withKey = result.data.map((item: any, idx: number) => ({
          ...item,
          key: item.key || item.id || item.code || (item.seedNumber + '_' + idx),
        }));
        setSowingList(withKey);
      } else {
        setSowingList([]);
      }
    } catch (error) {
      console.error('获取播种记录失败:', error);
      message.error('获取播种记录失败');
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
      content: `确定要删除种植编号为 ${record.code} 的记录吗？`,
      onOk: async () => {
        try {
          // 调用后端API删除记录
          await deleteSowingRecord({ plantid: record.code });
          
          // 删除成功后刷新数据
          await loadSowingRecords();
          
          message.success('删除成功');
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败，请重试');
        }
      },
    });
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        // const plantids = JSON.stringify({ plantids: selectedRowKeys })
        try {
          const res = await fetch('/api/seed/BatchDeleteSow', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keys: selectedRowKeys }),
          });
          console.log('批量删除请求:', JSON.stringify({ plantids: selectedRowKeys }));
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            setSowingList(sowingList.filter(item => !selectedRowKeys.includes(item.key)));
            setSelectedRowKeys([]);
            message.success(`已删除 ${selectedRowKeys.length} 条记录`);
          } else {
            message.error(result?.msg || '批量删除失败');
          }
        } catch (e) {
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  const columns = [
    {
      title: '种植编号',
      dataIndex: 'key',
      valueType: 'text',
      width: 80,
      search: false,
      render: (text: any, SowingRecord: any) => SowingRecord.code,
      sorter: (a: any, b: any) => (a.key || 0) - (b.key || 0),
    },
    // {
    //   title: '种植编号',
    //   dataIndex: 'plantingCode',
    // },
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
      render: (_: any, record: SowingRecord) => [
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