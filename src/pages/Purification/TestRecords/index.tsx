// 考种记载表
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';

const TestRecords: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

  // 加载考种记载表数据
  const loadExamRecords = () => {
    setLoading(true);
    try {
      const records = localStorage.getItem('examRecords');
      if (records) {
        const parsedRecords = JSON.parse(records);
        setDataSource(parsedRecords);
      }
    } catch (error) {
      console.error('Error loading exam records:', error);
      message.error('加载考种记载表数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 在组件挂载时加载数据
  useEffect(() => {
    loadExamRecords();
  }, []);

  // 保存编辑后的数据
  const handleSave = async (row: any) => {
    const newData = dataSource.map((item) => (item.id === row.id ? { ...item, ...row } : item));
    setDataSource(newData);
    localStorage.setItem('examRecords', JSON.stringify(newData));
    message.success('保存成功');
    return true;
  };

  // 删除当前行
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: () => {
        const newData = dataSource.filter(item => item.id !== record.id);
        setDataSource(newData);
        localStorage.setItem('examRecords', JSON.stringify(newData));
        message.success('删除成功');
      },
    });
  };

  // 留种功能
  const handleSaveSeed = (record: any) => {
    const existing = localStorage.getItem('savedSeeds');
    const savedSeeds = existing ? JSON.parse(existing) : [];
    // 判断是否已留种（以 code 唯一）
    if (savedSeeds.some((item: any) => item.code === record.code)) {
      message.info('已经留种');
      return;
    }
    // 构造和 SavedRecords 页面一致的字段
    const newSeed = {
      plantingcode: record.plantingcode,
      code: record.code,
      name: record.varietyName,
      method: record.method,
      type: record.type,
      isRegular: record.isRegular,
      generation: record.generation,
      amount: record.amount || 1,
      saveTime: new Date().toISOString(),
      source: record.source || '',
      key: Date.now() + Math.random(),
    };
    savedSeeds.push(newSeed);
    localStorage.setItem('savedSeeds', JSON.stringify(savedSeeds));
    message.success('留种成功');
  };

  // 处理导出
  const handleExport = () => {
    if (dataSource.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

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
      ...dataSource.map(record => [
        record.plantingcode,
        record.code,
        record.varietyName,
        record.method,
        record.type,
        record.isRegular ? '是' : '否',
        record.generation,
        record.amount,
        record.saveTime,
        record.source
      ].join(','))
    ].join('\n');

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

  const columns: ProColumns<any>[] = [
    {
      title: '系谱编号',
      dataIndex: 'plantingcode',
      copyable: true,
      editable: () => true,
    },
    {
      title: '编号',
      dataIndex: 'code',
      copyable: true,
      editable: () => true,
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
      editable: () => true,
    },
    {
      title: '引种方式',
      dataIndex: 'method',
      editable: () => true,
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      editable: () => true,
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
      valueEnum: {
        true: { text: '是', status: 'Success' },
        false: { text: '否', status: 'Error' },
      },
      editable: () => true,
    },
    {
      title: '世代',
      dataIndex: 'generation',
      editable: () => true,
    },
    {
      title: '数量',
      dataIndex: 'amount',
      editable: () => true,
    },
    {
      title: '留种时间',
      dataIndex: 'saveTime',
      valueType: 'dateTime',
      editable: () => true,
    },
    {
      title: '来源',
      dataIndex: 'source',
      editable: () => true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => setEditableKeys([record.id])}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => handleDelete(record)}
        >
          删除
        </a>,
        <a
          key="saveSeed"
          onClick={() => handleSaveSeed(record)}
        >
          留种
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<any>
        headerTitle="考种记载表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="export"
            type="primary"
            onClick={handleExport}
            icon={<ExportOutlined />}
          >
            导出
          </Button>,
        ]}
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (_, row) => handleSave(row),
          onChange: setEditableKeys,
        }}
        pagination={{
          pageSize: 10,
        }}
      />
    </PageContainer>
  );
};

export default TestRecords; 