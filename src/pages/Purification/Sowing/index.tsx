import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { useLocation } from '@umijs/max';
import { Button, Modal, message, Dropdown, Menu } from 'antd';
import { DeleteOutlined, ExportOutlined, DownOutlined } from '@ant-design/icons';

interface LocationState {
  sowingRecord?: SowingRecord;
  sowingRecords?: SowingRecord[];
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
  // 自交系纯化字段
  plantingCode: string;    // 种植编号
  sowingAmount: number;   // 播种数量
  sowingTime: string;    // 播种时间
  // 播种计划字段
  planCode: string;      // 计划编号
  status: string;        // 状态：未完成/已完成
  recordIndex?: number;  // 记录索引，用于区分同一种子的不同记录
};

const SowingList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const location = useLocation();
  const [dataSource, setDataSource] = useState<SowingRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 从 localStorage 获取数据
  useEffect(() => {
    const savedData = localStorage.getItem('purificationSowingRecords');
    if (savedData) {
      setDataSource(JSON.parse(savedData));
    }
  }, []);

  // 如果有新的播种记录，添加到数据源
  useEffect(() => {
    const state = location.state as LocationState;
    const { sowingRecords } = state || {};
    
    if (sowingRecords && sowingRecords.length > 0) {
      // 直接使用 localStorage 中的数据，因为它已经包含了最新的记录
      const savedData = localStorage.getItem('purificationSowingRecords');
      if (savedData) {
        setDataSource(JSON.parse(savedData));
      }
    }
  }, [location.state]);

  // 数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('purificationSowingRecords', JSON.stringify(dataSource));
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

  // 处理生成考种记载表
  const handleGenerateRecord = (record: SowingRecord) => {
    // 更新数据源中的状态
    const newDataSource = dataSource.map(item => {
      if (item.key === record.key) {
        return {
          ...item,
          status: '未完成'  // 先设置为未完成
        };
      }
      return item;
    });
    
    // 立即更新状态
    setDataSource(newDataSource);
    
    // 使用setTimeout确保状态已更新
    setTimeout(() => {
      const updatedDataSource = newDataSource.map(item => {
        if (item.key === record.key) {
          return {
            ...item,
            status: '已完成'
          };
        }
        return item;
      });
      
      // 更新状态并保存到localStorage
      setDataSource(updatedDataSource);
      localStorage.setItem('purificationSowingRecords', JSON.stringify(updatedDataSource));
      
      // 如果需要刷新表格
      if (actionRef.current) {
        actionRef.current.reload();
      }
      
      message.success('已生成考种记载表');
    }, 100);
  };

  // 处理导出本模块数据
  const handleExportCurrent = () => {
    if (dataSource.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    // 准备导出数据
    const exportData = dataSource.map(item => ({
      '种植编号': item.plantingCode,
      '编号': item.code,
      '品种名称': item.name,
      '引种方式': item.method,
      '品种类型': item.type,
      '是否常规': item.isRegular,
      '世代': item.generation,
      '播种数量': item.sowingAmount,
      '播种时间': item.sowingTime,
      '计划编号': item.planCode,
      '状态': item.status,
      '来源': '自交系纯化'  // 添加来源标识
    }));

    // 转换为CSV格式
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `自交系纯化播种记录_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('导出成功');
  };

  // 处理全部导出
  const handleExportAll = (module: string) => {
    // 这里需要根据选择的模块从localStorage获取相应的数据
    let exportData: any[] = [];
    let fileName = '';

    switch (module) {
      case '种质资源':
        const germplasmData = localStorage.getItem('germplasmRecords');
        if (germplasmData) {
          exportData = JSON.parse(germplasmData).map((item: any) => ({
            ...item,
            '来源': '种质资源'
          }));
        }
        fileName = '种质资源记录';
        break;
      case '引种模块':
        const introductionData = localStorage.getItem('introductionRecords');
        if (introductionData) {
          exportData = JSON.parse(introductionData).map((item: any) => ({
            ...item,
            '来源': '引种模块'
          }));
        }
        fileName = '引种记录';
        break;
      case '自交系纯化':
        exportData = dataSource.map(item => ({
          ...item,
          '来源': '自交系纯化'
        }));
        fileName = '自交系纯化记录';
        break;
      case '杂交组合':
        const hybridData = localStorage.getItem('hybridRecords');
        if (hybridData) {
          exportData = JSON.parse(hybridData).map((item: any) => ({
            ...item,
            '来源': '杂交组合'
          }));
        }
        fileName = '杂交组合记录';
        break;
    }

    if (exportData.length === 0) {
      message.warning(`没有${module}的数据可导出`);
      return;
    }

    // 转换为CSV格式
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('导出成功');
  };

  // 创建导出菜单
  const exportMenu = (
    <Menu onClick={({ key }) => handleExportAll(key)}>
      <Menu.Item key="种质资源">种质资源</Menu.Item>
      <Menu.Item key="引种模块">引种模块</Menu.Item>
      <Menu.Item key="自交系纯化">自交系纯化</Menu.Item>
      <Menu.Item key="杂交组合">杂交组合</Menu.Item>
    </Menu>
  );

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
      title: '播种数量',
      dataIndex: 'sowingAmount',
    },
    {
      title: '播种时间',
      dataIndex: 'sowingTime',
      valueType: 'date',
    },
    {
      title: '计划编号',
      dataIndex: 'planCode',
    },
    {
      title: '记录索引',
      dataIndex: 'recordIndex',
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        '未完成': { text: '未完成', status: 'Default' },
        '已完成': { text: '已完成', status: 'Success' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="generate"
          type="link"
          onClick={() => handleGenerateRecord(record)}
          disabled={record.status === '已完成'}
        >
          生成考种记载表
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
        headerTitle="播种计划"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="exportCurrent"
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExportCurrent}
            disabled={dataSource.length === 0}
          >
            导出本模块
          </Button>,
          <Dropdown key="exportAll" overlay={exportMenu}>
            <Button type="primary">
              全部导出 <DownOutlined />
            </Button>
          </Dropdown>,
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