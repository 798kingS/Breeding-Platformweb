import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { useLocation } from '@umijs/max';
import { Button, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface LocationState {
  testRecord?: TestRecord;
  isNewRecord?: boolean;
}

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
  const location = useLocation();
  const [dataSource, setDataSource] = useState<TestRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 从 localStorage 获取数据并处理新记录
  useEffect(() => {
    const state = location.state as LocationState;
    const { testRecord, isNewRecord } = state || {};
    
    // 从 localStorage 获取现有数据
    const savedData = localStorage.getItem('testRecords');
    const existingRecords: TestRecord[] = savedData ? JSON.parse(savedData) : [];
    
    if (testRecord && isNewRecord) {
      // 检查是否已存在相同种植编号的记录
      const existingIndex = existingRecords.findIndex(
        item => item.plantingCode === testRecord.plantingCode
      );
      
      if (existingIndex >= 0) {
        // 如果已存在，则更新该记录
        existingRecords[existingIndex] = testRecord;
      } else {
        // 如果不存在，则添加新记录
        existingRecords.push(testRecord);
      }
      
      // 保存更新后的记录到 localStorage
      localStorage.setItem('testRecords', JSON.stringify(existingRecords));
    }
    
    // 更新数据源
    setDataSource(existingRecords);
  }, [location.state]);

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