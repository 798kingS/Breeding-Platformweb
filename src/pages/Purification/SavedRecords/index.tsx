import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message, Input, Modal, Space } from 'antd';
import { ExportOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const PurificationSavedSeeds: React.FC = () => {
  const [savedSeedList, setSavedSeedList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    // 从localStorage加载留种记录
      const records = localStorage.getItem('PurificationSavedSeeds');
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
      '编号',
      '系谱编号',
      '长势',
      '结果数',
      '果型',
      '皮色',
      '肉色',
      '糖度(°Brix)',
      '质地',
    ];

    const csvContent = [
      headers.join(','),
      ...savedSeedList.map(item => [
        item.seedNumber || '',
        item.pedigreeNumber || '',
        item.growthStatus || '',
        item.resultCount || '',
        item.fruitShape || '',
        item.skinColor || '',
        item.fleshColor || '',
        item.sugarContent || '',
        item.texture || '',
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

  const handleDelete = (key: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const newList = savedSeedList.filter(item => item.key !== key);
        setSavedSeedList(newList);
        localStorage.setItem('PurificationSavedSeeds', JSON.stringify(newList));
        message.success('记录已删除');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const newList = savedSeedList.filter(item => !selectedRowKeys.includes(item.key));
        setSavedSeedList(newList);
        localStorage.setItem('PurificationSavedSeeds', JSON.stringify(newList));
        setSelectedRowKeys([]);
        message.success(`已删除 ${selectedRowKeys.length} 条记录`);
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredList = savedSeedList.filter(item =>
    (item.pedigreeNumber?.includes(searchText) || false) ||
    (item.seedNumber?.includes(searchText) || false)
  );

  const columns = [
    {
      title: '编号',
      dataIndex: 'seedNumber',
    },
    {
      title: '系谱编号',
      dataIndex: 'pedigreeNumber',
    },
    {
      title: '长势',
      dataIndex: 'growthStatus',
    },
    {
      title: '结果数',
      dataIndex: 'resultCount',
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
      title: '糖度(°Brix)',
      dataIndex: 'sugarContent',
    },
    {
      title: '质地',
      dataIndex: 'texture',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: any) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
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

export default PurificationSavedSeeds;