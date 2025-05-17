// 考种记载表
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { Button, message, Modal, Space } from 'antd';
import { EditOutlined, SaveOutlined, ExportOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface TestRecord {
  id: string;
  plantingCode: string;
  code: string;
  name: string;
  method: string;
  type: string;
  isRegular: string;
  generation: string;
  sowingAmount: number;
  sowingTime: string;
  planCode: string;
  recordIndex: number;
}

interface SavedSeedRecord {
  id: string;
  plantingCode: string;
  code: string;
  name: string;
  method: string;
  type: string;
  isRegular: string;
  generation: string;
  amount: number;
  saveTime: string;
  source: string;
}

const TestRecordsList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<TestRecord[]>([]);
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

  // 从 localStorage 获取数据
  useEffect(() => {
    const records = localStorage.getItem('testRecords');
    if (records) {
      setDataSource(JSON.parse(records));
    }
  }, []);

  // 处理数据保存
  const handleSave = (row: TestRecord) => {
    const newData = dataSource.map((item) => {
      if (item.id === row.id) {
        return { ...item, ...row };
      }
      return item;
    });
    setDataSource(newData);
    localStorage.setItem('testRecords', JSON.stringify(newData));
    message.success('保存成功');
  };

  // 处理留种
  const handleSaveSeed = (record: TestRecord) => {
    Modal.confirm({
      title: '确认留种',
      content: '确定要将此记录添加到留种记录吗？',
      onOk: () => {
        const savedSeedRecord: SavedSeedRecord = {
          id: `${record.id}_saved_${Date.now()}`,
          plantingCode: record.plantingCode,
          code: record.code,
          name: record.name,
          method: record.method,
          type: record.type,
          isRegular: record.isRegular,
          generation: record.generation,
          amount: record.sowingAmount,
          saveTime: new Date().toISOString().split('T')[0],
          source: '自交系纯化'
        };

        // 获取现有留种记录
        const existingRecords = localStorage.getItem('savedSeeds');
        const savedSeeds = existingRecords 
          ? [...JSON.parse(existingRecords), savedSeedRecord]
          : [savedSeedRecord];
        
        // 保存到 localStorage
        localStorage.setItem('savedSeeds', JSON.stringify(savedSeeds));
        message.success('添加到留种记录成功');
      }
    });
  };

  // 处理导出
  const handleExport = () => {
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
      '记录序号': item.recordIndex
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 种植编号
      { wch: 15 }, // 编号
      { wch: 20 }, // 品种名称
      { wch: 12 }, // 引种方式
      { wch: 12 }, // 品种类型
      { wch: 12 }, // 是否常规
      { wch: 10 }, // 世代
      { wch: 12 }, // 播种数量
      { wch: 15 }, // 播种时间
      { wch: 15 }, // 计划编号
      { wch: 10 }, // 记录序号
    ];
    ws['!cols'] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '考种记载表');

    // 生成Excel文件
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `考种记载表_${new Date().toLocaleDateString()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('导出成功');
  };

  const columns: ProColumns<TestRecord>[] = [
    {
      title: '种植编号',
      dataIndex: 'plantingCode',
      width: 120,
      editable: true,
    },
    {
      title: '编号',
      dataIndex: 'code',
      width: 120,
      editable: true,
    },
    {
      title: '品种名称',
      dataIndex: 'name',
      width: 150,
      editable: true,
    },
    {
      title: '引种方式',
      dataIndex: 'method',
      width: 100,
      editable: true,
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      width: 100,
      editable: true,
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
      width: 100,
      editable: true,
    },
    {
      title: '世代',
      dataIndex: 'generation',
      width: 80,
      editable: true,
    },
    {
      title: '播种数量',
      dataIndex: 'sowingAmount',
      width: 100,
      editable: true,
    },
    {
      title: '播种时间',
      dataIndex: 'sowingTime',
      width: 120,
      editable: true,
      valueType: 'date',
    },
    {
      title: '计划编号',
      dataIndex: 'planCode',
      width: 120,
      editable: true,
    },
    {
      title: '记录序号',
      dataIndex: 'recordIndex',
      width: 100,
      editable: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setEditableKeys([record.id]);
          }}
        >
          编辑
        </Button>,
        <Button
          key="save"
          type="link"
          icon={<SaveOutlined />}
          onClick={() => handleSaveSeed(record)}
        >
          留种
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<TestRecord>
        headerTitle="考种记载表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dataSource={dataSource}
        columns={columns}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (_, row) => {
            handleSave(row as TestRecord);
          },
          onChange: setEditableKeys,
        }}
        toolBarRender={() => [
          <Button
            key="export"
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
      />
    </PageContainer>
  );
};

export default TestRecordsList; 