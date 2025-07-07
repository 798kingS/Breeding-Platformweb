// 引种记录/考种记录
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

type TestRecord = {
  key: number;
  // 引种记录字段
  code: string;           // 编号
  name: string;          // 引种名称
  method: string;       // 引种方式
  type: string;         // 品种类型
  isRegular: string;    // 是否常规
  generation: string;   // 世代
  introductionTime: string; // 引种时间
  // 播种记录字段
  plantingCode: string;    // 种植编号
  sowingAmount: number;   // 播种数量
  planCode: string;      // 计划编号
  sowingTime: string;    // 播种时间
  // 考种记录字段
  testTime: string;      // 考种时间
  germinationRate?: number; // 发芽率
  purityRate?: number;    // 纯度
  remarks?: string;       // 备注
};

const TestList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<TestRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 页面加载时从后端获取考种记录
  useEffect(() => {
    const fetchTestRecords = async () => {
      try {
        const response = await fetch('/api/introduction-test-records');
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setDataSource(result.data);
        } else {
          setDataSource([]);
        }
      } catch (error) {
        message.error('获取考种记录失败');
        setDataSource([]);
      }
    };
    fetchTestRecords();
  }, []);

  // 数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('testRecords', JSON.stringify(dataSource));
  }, [dataSource]);

  // 处理单个删除
  const handleDelete = (record: TestRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除种植编号为 ${record.plantingCode} 的记录吗？`,
      onOk: () => {
        const newDataSource = dataSource.filter(item => item.key !== record.key);
        setDataSource(newDataSource);
        message.success('删除成功');
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
      onOk: () => {
        const newDataSource = dataSource.filter(
          item => !selectedRowKeys.includes(item.key)
        );
        setDataSource(newDataSource);
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  const columns: ProColumns<TestRecord>[] = [
    {
      title: '种植编号',
      dataIndex: 'plantingCode',
    },
    {
      title: '编号',
      dataIndex: 'code',
    },
    {
      title: '品种名称',
      dataIndex: 'name',
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
      title: '引种时间',
      dataIndex: 'introductionTime',
      valueType: 'date',
    },
    {
      title: '播种数量',
      dataIndex: 'sowingAmount',
    },
    {
      title: '计划编号',
      dataIndex: 'planCode',
    },
    {
      title: '播种时间',
      dataIndex: 'sowingTime',
      valueType: 'date',
    },
    {
      title: '考种时间',
      dataIndex: 'testTime',
      valueType: 'date',
    },
    {
      title: '发芽率(%)',
      dataIndex: 'germinationRate',
      valueType: 'digit',
      editable: () => true,
    },
    {
      title: '纯度(%)',
      dataIndex: 'purityRate',
      valueType: 'digit',
      editable: () => true,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      editable: () => true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditableKeys([record.key]);
          }}
        >
          编辑
        </Button>,
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
    <PageContainer>
      <ProTable<TestRecord>
        headerTitle="考种记录"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="batchDelete"
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        dataSource={dataSource}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => {
            return [defaultDom.save, defaultDom.cancel];
          },
          onSave: async (key, row) => {
            const newData = dataSource.map((item) =>
              item.key === key ? { ...item, ...row } : item
            );
            setDataSource(newData);
          },
        }}
        columns={columns}
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

export default TestList; 