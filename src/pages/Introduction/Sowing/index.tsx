import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { Button, message, Modal } from 'antd';
import { history, useLocation } from '@umijs/max';
import { DeleteOutlined } from '@ant-design/icons';

interface LocationState {
  sowingRecord?: SowingRecord;
}

type SowingRecord = {
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
  status: string;        // 状态：未生成考种记录/已生成考种记录
};

// 考种记录类型定义
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
};

const SowingList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const location = useLocation();
  const [dataSource, setDataSource] = useState<SowingRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 从 localStorage 获取数据
  useEffect(() => {
    const savedData = localStorage.getItem('sowingRecords');
    if (savedData) {
      setDataSource(JSON.parse(savedData));
    }
  }, []);

  // 如果有新的播种记录，添加到数据源
  useEffect(() => {
    const state = location.state as LocationState;
    const { sowingRecord } = state || {};
    if (sowingRecord && !dataSource.some(item => item.key === sowingRecord.key)) {
      setDataSource(prev => [...prev, sowingRecord]);
    }
  }, [location.state]);

  // 数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('sowingRecords', JSON.stringify(dataSource));
  }, [dataSource]);

  // 处理单个删除
  const handleDelete = (record: SowingRecord) => {
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

  const handleGenerateTestRecord = (record: SowingRecord) => {
    // 检查是否已经生成过考种记录
    if (record.status === 'Success') {
      message.warning('该记录已生成考种记载表！');
      return;
    }

    // 更新状态
    const newDataSource = dataSource.map(item => {
      if (item.key === record.key) {
        return { ...item, status: 'Success' };
      }
      return item;
    });
    setDataSource(newDataSource);
    localStorage.setItem('sowingRecords', JSON.stringify(newDataSource));

    // 创建考种记录，只包含当前行的信息
    const testRecord = {
      key: Date.now(), // 生成新的唯一key
      // 引种记录字段
      code: record.code,
      name: record.name,
      method: record.method,
      type: record.type,
      isRegular: record.isRegular,
      generation: record.generation,
      introductionTime: record.introductionTime,
      // 播种记录字段
      plantingCode: record.plantingCode,
      sowingAmount: record.sowingAmount,
      planCode: record.planCode,
      sowingTime: record.sowingTime,
      // 考种记录字段
      testTime: new Date().toISOString().split('T')[0],
    };
    
    // 保存考种记录到 localStorage
    const savedTestRecords = localStorage.getItem('testRecords') || '[]';
    const testRecords = JSON.parse(savedTestRecords);
    
    // 检查是否已存在相同种植编号的考种记录
    const existingRecordIndex = testRecords.findIndex(
      (item: TestRecord) => item.plantingCode === record.plantingCode
    );
    
    if (existingRecordIndex >= 0) {
      // 如果已存在，则更新而不是添加
      testRecords[existingRecordIndex] = testRecord;
    } else {
      // 如果不存在，则添加新记录
      testRecords.push(testRecord);
    }
    
    localStorage.setItem('testRecords', JSON.stringify(testRecords));
    
    // 跳转到考种记录页面，并传递新生成的考种记录
    history.push('/introduction/test', { 
      testRecord,
      isNewRecord: true // 添加标记，表示这是一个新生成的记录
    });
    message.success('考种记载表生成成功！');
  };

  const columns: ProColumns<SowingRecord>[] = [
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
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        '未生成考种记录': { text: '未生成考种记录', status: 'Default' },
        'Success': { text: '已生成考种记录', status: 'Success' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        record.status === '未生成考种记录' && (
          <Button
            key="generate"
            type="link"
            onClick={() => handleGenerateTestRecord(record)}
          >
            生成考种记载表
          </Button>
        ),
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
      <ProTable<SowingRecord>
        headerTitle="播种记录"
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

export default SowingList; 