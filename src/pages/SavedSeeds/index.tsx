import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, message, Input, Modal, Space } from 'antd';
import { ExportOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const SavedSeeds: React.FC = () => {
  const [savedSeedList, setSavedSeedList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    // 页面加载时从后端获取留种记录
    const fetchSavedSeeds = async () => {
      try {
        const response = await fetch('/api/seed/getReserve');
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        console.log(result);
        if (Array.isArray(result.data)) {
          setSavedSeedList(result.data);
        } else {
          setSavedSeedList([]);
        }
       } catch (error) {
         message.error('获取留种记录失败');
         setSavedSeedList([]);
       }
    };
    fetchSavedSeeds();
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

  const handleDelete = async (key: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 假设后端用key为唯一标识
          const res = await fetch(`/api/seed/reservedelete?plantid=${key}`, { method: 'DELETE' });
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            const newList = savedSeedList.filter(item => item.key !== key);
            setSavedSeedList(newList);
            localStorage.setItem('savedSeeds', JSON.stringify(newList));
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
        // const plantids = JSON.stringify({ plantids: selectedRowKeys })
        try {
          const res = await fetch('/api/seed/BatchDeleteSeed', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keys: selectedRowKeys }),
          });
          console.log('批量删除请求:', JSON.stringify({ plantids: selectedRowKeys }));
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            setSavedSeedList(savedSeedList.filter(item => !selectedRowKeys.includes(item.key)));
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

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredList = savedSeedList.filter(item =>
    (item.varietyName?.includes(searchText) || false) ||
    (item.seedNumber?.includes(searchText) || false)
  );

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
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
    </PageContainer>
  );
};

export default SavedSeeds; 