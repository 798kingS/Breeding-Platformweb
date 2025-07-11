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

  const token = localStorage.getItem('token');

  // 页面加载时从后端获取自交系纯化考种记载表数据
  useEffect(() => {
    const fetchTestRecords = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/Selfing/getExamination', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        console.log('获取考种记载表数据:', result);
        if (Array.isArray(result.data)) {
          // 保证每条数据有唯一id
          const withId = result.data.map((item: any, idx: number) => ({
            ...item,
            id: item.id ?? item.ID ?? item.key ?? idx + '_' + Date.now(),
          }));
          setDataSource(withId);
        } else {
          setDataSource([]);
        }
      } catch (error) {
        message.error('获取考种记载表数据失败');
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestRecords();
  }, []);

  // 保存编辑后的数据
  const handleSave = async (row: any) => {
    try {
      const response = await fetch('/api/Selfing/editexamination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(row),
      });
      const result = await response.json();
      if (response.ok && result.success !== false) {
        const newData = dataSource.map((item) => (item.id === row.id ? { ...item, ...row } : item));
        setDataSource(newData);
        message.success('保存成功');
        return true;
      } else {
        message.error(result.message || '保存失败');
        return false;
      }
    } catch (error) {
      message.error('保存失败，请重试');
      return false;
    }
  };

  // 删除当前行
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        try {
          const response = await fetch(`/api/Selfing/editexaminationdelete?plantid=${record.plantingCode}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify({ id: record.id }),
          });
          const result = await response.json();
          if (response.ok && result.success !== false) {
            const newData = dataSource.filter(item => item.id !== record.id);
            setDataSource(newData);
            message.success('删除成功');
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败，请重试');
        }
      },
    });
  };

  // 批量删除功能
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
          // 取出选中行的plantingCode
          const plantingCodes = selectedRowKeys.map(key => {
            const row = dataSource.find(item => item.id === key);
            return row?.plantingCode;
          }).filter(Boolean);
          const response = await fetch('/api/Selfing/BatchDeleteExamination', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify({ keys: plantingCodes }),
          });
          console.log('批量删除请求:', JSON.stringify({ keys: plantingCodes }));
          const result = await response.json();
          if (response.ok && result.success !== false) {
            const newData = dataSource.filter(item => !selectedRowKeys.includes(item.id));
            setDataSource(newData);
            setSelectedRowKeys([]);
            message.success('批量删除成功');
          } else {
            message.error(result.message || '批量删除失败');
          }
        } catch (error) {
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  // 留种功能
  const handleSaveSeed = async (record: any) => {
    try {
      const payload = {
        plantingCode: record.plantingCode,
        code: record.code,
        varietyName: record.varietyName,
        method: record.method,
        type: record.type,
        isRegular: record.isRegular,
        generation: record.generation,
        amount: record.amount || 1,
        saveTime: new Date().toISOString(),
        source: record.source || '',
        key: record.id || Date.now() + Math.random(),
      };
      const response = await fetch('/api/Selfing/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok && result.success !== false) {
        message.success('留种成功');
      } else {
        message.error(result.message || '留种失败');
      }
    } catch (error) {
      message.error('留种失败，请重试');
    }
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
        record.generateCount,
        record.createTime,
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
      dataIndex: 'plantingCode',
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
      dataIndex: 'generateCount',
      editable: () => true,
    },
    {
      title: '留种时间',
      dataIndex: 'createTime',
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
      render: (_, record, __, action) => [
        <a
          key="edit"
          onClick={() => action?.startEditable?.(record.id)}
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
          <Button
            key="batchDelete"
            danger
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>,
        ]}
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (_, row) => handleSave(row),
          onChange: setEditableKeys,
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
    </PageContainer>
  );
};

export default TestRecords; 