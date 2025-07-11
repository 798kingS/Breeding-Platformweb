import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space } from 'antd';
import { ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
const PurificationSavedSeeds: React.FC = () => {
  const [savedSeedList, setSavedSeedList] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filteredList, setFilteredList] = useState<any[]>([]);

  // 页面加载时从后端获取自交系纯化留种记录
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchSavedRecords = async () => {
      try {
        const response = await fetch('/api/Selfing/getReserve', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        console.log('获取留种记录:', result);
        if (Array.isArray(result.data)) {
          // 保证每条数据有唯一key，优先用code
          const withKey = result.data.map((item: any, idx: number) => ({
            ...item,
            key: item.code ?? item.id ?? idx + '_' + Date.now(),
          }));
          setSavedSeedList(withKey);
        } else {
          setSavedSeedList([]);
        }
      } catch (error) {
        message.error('获取留种记录失败');
        setSavedSeedList([]);
      }
    };
    fetchSavedRecords();
  }, []);

  useEffect(() => {
    setFilteredList(savedSeedList);
  }, [savedSeedList]);

  // 实时过滤逻辑
  const handleFormChange = (_: any, all: any) => {
    let data = savedSeedList;
    Object.entries(all).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'saveTime') {
        if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
          data = data.filter(item => item[key] && dayjs(item[key]).format('YYYY-MM-DD').includes(dayjs(value).format('YYYY-MM-DD')));
        }
      } else {
        data = data.filter(item => (item[key] ?? '').toString().includes(value));
      }
    });
    setFilteredList(data);
  };

  const handleExport = () => {
    if (filteredList.length === 0) {
      message.warning('暂无留种记录');
      return;
    }

    // 创建CSV内容，字段顺序与 columns 保持一致
    const headers = [
      '系谱编号',
      '编号',
      '品种名称',
      '引种方式',
      '品种类型',
      '是否常规',
      '世代',
      '数量',
      '留种时间',
      '来源'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredList.map(item => [
        item.plantingCode || '',
        item.code || '',
        item.varietyName || '',
        item.method || '',
        item.type || '',
        item.isRegular || '',
        item.generation || '',
        item.amount || '',
        item.saveTime ? '\t' + dayjs(item.saveTime).format('YYYY-MM-DD HH:mm:ss') : '',
        item.source || ''
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

  const handleDelete = async (plantid: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`/api/Selfing/reservedelete?plantid=${plantid}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
          });
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            const newList = savedSeedList.filter(item => item.plantingCode !== plantid);
            setSavedSeedList(newList);
            message.success('记录已删除');
          } else {
            message.error(result?.msg || '删除失败');
          }
        } catch (e) {
          message.error('删除失败，请重试');
        }
      },
    });
  };

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
        try {
          const plantids = selectedRowKeys; // 直接用rowKey
          const response = await fetch('/api/Selfing/BatchDeleteReserve', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify({ keys: plantids }),
          });
          console.log('批量删除请求:', JSON.stringify({ keys: plantids }));
          const result = await response.json();
          if (response.ok && result.success !== false) {
            const newList = savedSeedList.filter(item => !plantids.includes(item.plantingCode));
            setSavedSeedList(newList);
            setSelectedRowKeys([]);
            message.success(`已删除 ${plantids.length} 条记录`);
          } else {
            message.error(result.message || '批量删除失败');
          }
        } catch (error) {
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  const columns = [
    {
      title: '系谱编号',
      dataIndex: 'plantingCode',
      valueType: 'text',
      fieldProps: { placeholder: '请输入系谱编号' },
    },
    {
      title: '编号',
      dataIndex: 'code',
      valueType: 'text',
      fieldProps: { placeholder: '请输入编号' },
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
      valueType: 'text',
      fieldProps: { placeholder: '请输入品种名称' },
    },
    {
      title: '引种方式',
      dataIndex: 'method',
      valueType: 'text',
      fieldProps: { placeholder: '请输入引种方式' },
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      valueType: 'text',
      fieldProps: { placeholder: '请输入品种类型' },
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
      valueType: 'text',
      fieldProps: { placeholder: '请输入是否常规' },
    },
    {
      title: '世代',
      dataIndex: 'generation',
      valueType: 'text',
      fieldProps: { placeholder: '请输入世代' },
    },
    {
      title: '数量',
      dataIndex: 'amount',
      valueType: 'digit',
      fieldProps: { placeholder: '请输入数量' },
    },
    {
      title: '留种时间',
      dataIndex: 'saveTime',
      valueType: 'dateTime',
      render: (_: any, record: any) => record.saveTime ? dayjs(record.saveTime).format('YYYY-MM-DD HH:mm:ss') : '-',
      fieldProps: { placeholder: '请选择留种时间' },
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueType: 'text',
      fieldProps: { placeholder: '请输入来源' },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      valueType: 'option',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.plantingCode)}
        >
          删除
        </Button>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <PageContainer
      header={{
        title: '留种记录',
        extra: [
          <Space key="actions">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={filteredList.length === 0}
            >
              导出记录
            </Button>
          </Space>
        ],
      }}
    >
      <ProTable
        rowKey="plantingCode"
        columns={columns}
        dataSource={filteredList}
        search={{
          labelWidth: 90,
          defaultCollapsed: true,
          collapseRender: (collapsed: boolean) => (collapsed ? '展开 ∨' : '收起 ∧'),
          filterType: 'query',
        }}
        form={{
          syncToUrl: false,
          onValuesChange: handleFormChange,
        }}
        rowSelection={rowSelection}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        toolBarRender={false}
        scroll={{ x: 2000 }}
      />
    </PageContainer>
  );
};

export default PurificationSavedSeeds;