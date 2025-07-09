import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message, Input, Modal, Space } from 'antd';
import { ExportOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const PurificationSavedSeeds: React.FC = () => {
  const [savedSeedList, setSavedSeedList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 页面加载时从后端获取自交系纯化留种记录
  useEffect(() => {
    const fetchSavedRecords = async () => {
      try {
        const response = await fetch('/api/Selfing/getReserve');
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

  const handleExport = () => {
    if (savedSeedList.length === 0) {
      message.warning('暂无留种记录');
      return;
    }

    // 创建CSV内容
    const headers = [
      '种植编号',
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
      ...savedSeedList.map(item => [
        item.plantingCode || '',
        item.code || '',
        item.name || '',
        item.method || '',
        item.type || '',
        item.isRegular || '',
        item.generation || '',
        item.amount || '',
        item.saveTime || '',
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
            headers: { 'Content-Type': 'application/json' },
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

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredList = savedSeedList.filter(item =>
    (item.name?.includes(searchText) || false) ||
    (item.code?.includes(searchText) || false)
  );

  const columns = [
    {
      title: '系谱编号',
      dataIndex: 'plantingCode',
    },
    {
      title: '编号',
      dataIndex: 'code',
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
    },
    {
      title: '引种方式',
      dataIndex: 'method',
    },
    {
      title: '品种类型',
      dataIndex: 'type',
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
    },
    {
      title: '世代',
      dataIndex: 'generation',
    },
    {
      title: '数量',
      dataIndex: 'amount',
    },
    {
      title: '留种时间',
      dataIndex: 'saveTime',
    },
    {
      title: '操作',
      dataIndex: 'operation',
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
            <Input
              placeholder="搜索品种名称或编号"
              prefix={<SearchOutlined />}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出记录
            </Button>
          </Space>
        ],
      }}
    >
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredList}
        rowKey="plantingCode"
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

export default PurificationSavedSeeds;