// 引种管理/播种记录
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { Button, message, Modal } from 'antd';
import { useLocation } from '@umijs/max';
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
  state?: number;        // 新增：考种状态 1-已考种 0-未考种
};

const SowingList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const location = useLocation();
  const [dataSource, setDataSource] = useState<SowingRecord[]>([]);
  const [filteredData, setFilteredData] = useState<SowingRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const token = localStorage.getItem('token');
  const fetchSowingRecords = async () => {
    try {
      const response = await fetch('/api/introduction/getIntroductionSow', {
        headers: {  
          Authorization: `Bearer ${token}`,
        },
      }
        );
      if (!response.ok) throw new Error('网络错误');
      const result = await response.json();
      console.log('获取播种记录:', result);
      if (Array.isArray(result.data)) {
        // 保证每条数据的key唯一
        const withKey = result.data.map((item: any, idx: number) => ({
          ...item,
          key: item.key ?? item.id ?? (item.plantingCode + '_' + item.code + '_' + idx),
        }));
        setDataSource(withKey);
        setFilteredData(withKey);
      } else {
        setDataSource([]);
        setFilteredData([]);
      }
    } catch (error) {
      message.error('获取播种记录失败');
      setDataSource([]);
      setFilteredData([]);
    }
  };
  // 页面加载时从后端获取播种记录
  useEffect(() => {
    fetchSowingRecords();
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

  // 实时查询：监听ProTable表单变化，实时过滤
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
    if (all.status) result = result.filter(item => (item.status ?? '').toString().includes(all.status));
    setFilteredData(result);
  };

  // 处理单个删除
  const handleDelete = (record: SowingRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除种植编号为 ${record.plantingCode} 的记录吗？`,
      onOk: async () => {
        try {
          const res = await fetch(`/api/introduction/introductionSowDelete?plantid=${record.plantingCode}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            const newDataSource = dataSource.filter(item => item.plantingCode !== record.plantingCode);
            setDataSource(newDataSource);
            message.success('删除成功');
            fetchSowingRecords();
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
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const plantids = selectedRowKeys.map(key => {
            const row = dataSource.find(item => item.key === key);
            return row?.plantingCode;
          }).filter(Boolean);
          const res = await fetch('/api/introduction/BatchDeleteSow', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ keys: plantids }),
          });
          console.log('批量删除请求:', JSON.stringify({ keys: plantids }));
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            setDataSource(dataSource.filter(item => !plantids.includes(item.plantingCode)));
            setSelectedRowKeys([]);
            await fetchSowingRecords();
            message.success(`已删除 ${plantids.length} 条记录`);
          } else {
            message.error(result?.msg || '批量删除失败');
          }
        } catch (e) {
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  // 处理批量播种
  const handleBatchSowing = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要批量播种的记录');
      return;
    }
    Modal.confirm({
      title: '确认批量播种',
      content: `确定要批量播种选中的 ${selectedRowKeys.length} 条记录吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const plantingCodes = selectedRowKeys; // rowKey为plantingCode
          const res = await fetch('/api/introduction/BatchSowing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ plantingCodes }),
          });
          console.log('批量播种请求:', JSON.stringify({ plantingCodes }));
          const result = await res.json();
          if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
            message.success(`已批量播种 ${plantingCodes.length} 条记录`);
            setSelectedRowKeys([]);
            fetchSowingRecords();
          } else {
            message.error(result?.msg || '批量播种失败');
          }
        } catch (e) {
          message.error('批量播种失败，请重试');
        }
      },
    });
  };

  // 新增：考种按钮处理函数
  const handleTest = async (record: SowingRecord) => {
    try {
      const response = await fetch('/api/introduction/examination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(record),
      });
      const result = await response.json();
      if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
        // 只更新当前行的status，直接用后端返回的status值
        const newStatus = result.data.state ? '未考种' : '已考种';
        const newDataSource = dataSource.map(item =>
          item.key === record.key ? { ...item, status: newStatus } : item
        );
        setDataSource(newDataSource);
        setFilteredData(prev => prev.map(item =>
          item.key === record.key ? { ...item, status: newStatus } : item
        ));
        await fetchSowingRecords();
        message.success(newStatus === '已考种' ? '已完成考种' : '考种记录生成成功');
      } else {
        message.error(result?.msg || '考种失败');
      }
    } catch (e) {
      message.error('考种失败，请重试');
    }
  };

  const columns: ProColumns<SowingRecord>[] = [
    {
      title: '种植编号',
      dataIndex: 'plantingCode',
    },
    {
      title: '编号',
      dataIndex: 'plancode',
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
      title: '状态',
      dataIndex: 'state',
      render: (_, record) => {
        if (record.state === 1) {
          return <span style={{ color: 'green' }}>已考种</span>;
        }
        if (record.state === 0) {
          return <span style={{ color: 'red' }}>未考种</span>;
        }
        return <span>-</span>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="test"
          type="link"
          disabled={record.status === '已完成考种' || record.status === '已生成考种记录' || record.status === '已生成考种'}
          onClick={() => handleTest(record)}
        >
          {record.status === '已生成考种' ? '已生成考种' : (record.status === '已完成考种' || record.status === '已生成考种记录' ? '种子已考种' : '考种')}
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
      <ProTable<SowingRecord>
        headerTitle="播种记录"
        actionRef={actionRef}
        rowKey="key"
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
          // <Button
          //   key="batchSowing"
          //   type="primary"
          //   onClick={handleBatchSowing}
          //   disabled={selectedRowKeys.length === 0}
          // >
          //   批量播种
          // </Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        dataSource={filteredData}
        // onSubmit={handleSearch} // 已用onValuesChange实时过滤，无需onSubmit
        onReset={() => setFilteredData(dataSource)}
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