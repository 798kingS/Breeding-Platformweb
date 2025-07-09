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
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<TestRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const token = localStorage.getItem('token');
  const fetchTestRecords = async () => {
    try {
      const response = await fetch('/api/introduction/getIntroducionExamination', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
      );
      if (!response.ok) throw new Error('网络错误');
      const result = await response.json();
      console.log('获取考种记录:', result);
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

  // 页面加载时从后端获取考种记录
  useEffect(() => {
    fetchTestRecords();
  }, []);

  // 数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('testRecords', JSON.stringify(dataSource));
  }, [dataSource]);

  // 实时查询：监听ProTable表单变化，实时过滤
  const [filteredData, setFilteredData] = useState<TestRecord[]>([]);
  useEffect(() => { setFilteredData(dataSource); }, [dataSource]);
  const handleValuesChange = (_: any, all: any) => {
    let result = dataSource;
    if (all.plantingCode) result = result.filter(item => (item.plantingCode ?? '').toString().includes(all.plantingCode));
    if (all.code) result = result.filter(item => (item.code ?? '').toString().includes(all.code));
    if (all.name) result = result.filter(item => (item.name ?? '').toString().includes(all.name));
    if (all.method) result = result.filter(item => (item.method ?? '').toString().includes(all.method));
    if (all.type) result = result.filter(item => (item.type ?? '').toString().includes(all.type));
    if (all.isRegular) result = result.filter(item => (item.isRegular ?? '').toString().includes(all.isRegular));
    if (all.generation) result = result.filter(item => (item.generation ?? '').toString().includes(all.generation));
    if (all.introductionTime) result = result.filter(item => (item.introductionTime ?? '').toString().includes(all.introductionTime));
    if (all.sowingAmount) result = result.filter(item => String(item.sowingAmount ?? '').includes(all.sowingAmount));
    if (all.planCode) result = result.filter(item => (item.planCode ?? '').toString().includes(all.planCode));
    if (all.sowingTime) result = result.filter(item => (item.sowingTime ?? '').toString().includes(all.sowingTime));
    if (all.testTime) result = result.filter(item => (item.testTime ?? '').toString().includes(all.testTime));
    if (all.germinationRate) result = result.filter(item => String(item.germinationRate ?? '').includes(all.germinationRate));
    if (all.purityRate) result = result.filter(item => String(item.purityRate ?? '').includes(all.purityRate));
    if (all.remarks) result = result.filter(item => (item.remarks ?? '').toString().includes(all.remarks));
    setFilteredData(result);
  };

  // 处理单个删除
  const handleDelete = async (record: TestRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除种植编号为 ${record.plantingCode} 的记录吗？`,
      onOk: async () => {
        try {
          const res = await fetch(`/api/introduction/examinationdelete?plantid=${record.plantingCode}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
          });
          const result = await res.json();
          console.log('删除考种记录:', result);
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            setDataSource(dataSource.filter(item => item.plantingCode !== record.plantingCode));
            message.success('删除成功');
            fetchTestRecords();
          } else {
            message.error(result?.msg || '删除失败');
          }
        } catch (e) {
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
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: async () => {
        try {
          const plantids = selectedRowKeys; // 直接用rowKey
          const res = await fetch('/api/introduction/BatchDeleteExamination', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify({ keys: plantids }),
          });
          console.log('批量删除考种记录:', JSON.stringify({ keys: plantids }));
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            setDataSource(dataSource.filter(item => !plantids.includes(item.plantingCode)));
            setSelectedRowKeys([]);
            message.success('批量删除成功');
          } else {
            message.error(result?.msg || '批量删除失败');
          }
        } catch (e) {
          message.error('批量删除失败，请重试');
        }
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
            setEditableKeys([record.plantingCode]);
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
        rowKey="plantingCode"
        search={{
          labelWidth: 120,
        }}
        form={{
          onValuesChange: handleValuesChange,
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
        dataSource={filteredData}
        editable={{
          type: 'single',
          editableKeys,
          onChange: (keys) => setEditableKeys(keys.map(String)),
          onSave: async (_plantingCode, row) => {
            // 编辑保存时，POST到后端
            try {
              const response = await fetch('/api/introduction/examinationedit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                 },
                body: JSON.stringify(row),
              });
              console.log('编辑考种记录:', row);
              if (response.ok) {
                message.success('保存成功');
                // 保存成功后刷新表格
                const fetchRes = await fetch('/api/introduction/getIntroducionExamination', {
                  headers: { 'Authorization': `Bearer ${token}` },
                });
                const fetchJson = await fetchRes.json();
                console.log('刷新考种记录:', fetchJson);
                if (Array.isArray(fetchJson.data)) {
                  setDataSource(fetchJson.data);
                }
              } else {
                message.error('保存失败');
              }
            } catch (e) {
              message.error('保存失败');
            }
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