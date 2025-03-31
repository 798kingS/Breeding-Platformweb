import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { Button, message, Upload, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { utils as XLSXUtils, read as XLSXRead, writeFile as XLSXWriteFile } from 'xlsx';
import { history } from '@umijs/max';
import moment from 'moment';

// 定义播种记录类型
type SowingRecord = {
  plantingCode: string;    // 种植编号
  code: string;           // 编号
  name: string;          // 品种名称
  sowingAmount: number;   // 播种数量
  planCode: string;      // 计划编号
};

// 定义表格数据类型
type IntroductionRecord = {
  key: number;
  code: string;         // 编号
  name: string;         // 引种名称
  method: string;       // 引种方式
  type: string;         // 品种类型
  isRegular: string;    // 是否常规
  generation: string;   // 世代
  time: string;         // 引种时间
};

const IntroductionList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const [sowingModalVisible, setSowingModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IntroductionRecord | null>(null);
  const [form] = Form.useForm();

  // 从 localStorage 获取初始数据
  const [dataSource, setDataSource] = useState<IntroductionRecord[]>(() => {
    const savedData = localStorage.getItem('introductionRecords');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [
      {
        key: 1,
        code: 'YZ001',
        name: '京欣1号',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F2',
        time: '2024-03-15',
      },
      {
        key: 2,
        code: 'YZ002',
        name: '甜王2号',
        method: '交换',
        type: '甜瓜',
        isRegular: '否',
        generation: 'F1',
        time: '2024-03-16',
      },
      {
        key: 3,
        code: 'YZ003',
        name: '金玉3号',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F2',
        time: '2024-03-17',
      },
      {
        key: 4,
        code: 'YZ004',
        name: '蜜宝4号',
        method: '赠送',
        type: '甜瓜',
        isRegular: '否',
        generation: 'F3',
        time: '2024-03-18',
      },
      {
        key: 5,
        code: 'YZ005',
        name: '南瓜王',
        method: '购买',
        type: '南瓜',
        isRegular: '是',
        generation: 'F1',
        time: '2024-03-19',
      },
      {
        key: 6,
        code: 'YZ006',
        name: '甜蜜红玉',
        method: '交换',
        type: '西瓜',
        isRegular: '否',
        generation: 'F2',
        time: '2024-03-20',
      },
      {
        key: 7,
        code: 'YZ007',
        name: '金瓜5号',
        method: '购买',
        type: '南瓜',
        isRegular: '是',
        generation: 'F3',
        time: '2024-03-21',
      },
      {
        key: 8,
        code: 'YZ008',
        name: '蜜瓜皇后',
        method: '赠送',
        type: '甜瓜',
        isRegular: '否',
        generation: 'F2',
        time: '2024-03-22',
      },
      {
        key: 9,
        code: 'YZ009',
        name: '翠玉6号',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F1',
        time: '2024-03-23',
      },
      {
        key: 10,
        code: 'YZ010',
        name: '金冠7号',
        method: '交换',
        type: '南瓜',
        isRegular: '否',
        generation: 'F2',
        time: '2024-03-24',
      },
      {
        key: 11,
        code: 'YZ011',
        name: '红心甜王',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F3',
        time: '2024-03-25',
      },
      {
        key: 12,
        code: 'YZ012',
        name: '蜜瓜新秀',
        method: '赠送',
        type: '甜瓜',
        isRegular: '否',
        generation: 'F1',
        time: '2024-03-26',
      }
    ];
  });

  // 数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('introductionRecords', JSON.stringify(dataSource));
  }, [dataSource]);

  // 处理播种
  const handleSowing = (record: IntroductionRecord) => {
    setSowingModalVisible(true);
    form.setFieldsValue({
      plantingCode: `TZ-${Math.floor(Math.random() * 1000)}`,
      code: record.code,
      name: record.name,
      planCode: new Date().getFullYear().toString(),
      method: record.method,
      type: record.type,
      isRegular: record.isRegular,
      generation: record.generation,
      introductionTime: record.time,
    });
  };

  // 处理生成考种记载表
  const handleGenerateTestRecord = async () => {
    try {
      const values = await form.validateFields();
      const sowingRecord = {
        ...values,
        key: Date.now(),
        sowingTime: new Date().toISOString().split('T')[0],
        status: '未生成考种记录',
      };

      // 保存播种记录到 localStorage
      const savedSowingRecords = localStorage.getItem('sowingRecords') || '[]';
      const sowingRecords = JSON.parse(savedSowingRecords);
      sowingRecords.push(sowingRecord);
      localStorage.setItem('sowingRecords', JSON.stringify(sowingRecords));

      // 跳转到播种记录页面
      history.push('/introduction/sowing', { sowingRecord });
      message.success('播种记录已保存！');
      setSowingModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  // 处理Excel导入
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSXRead(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const results = XLSXUtils.sheet_to_json<any>(worksheet);
      
      const newData = results.map((item: any, index) => ({
        key: dataSource.length + index + 1,
        code: item['编号'],
        name: item['引种名称'],
        method: item['引种方式'],
        type: item['品种类型'],
        isRegular: item['是否常规'],
        generation: item['世代'],
        time: item['引种时间'],
      }));

      setDataSource([...dataSource, ...newData]);
      message.success('导入成功');
    };
    reader.readAsBinaryString(file);
    return false;
  };

  // 处理Excel导出
  const handleExport = () => {
    const ws = XLSXUtils.json_to_sheet(
      dataSource.map(item => ({
        '编号': item.code,
        '引种名称': item.name,
        '引种方式': item.method,
        '品种类型': item.type,
        '是否常规': item.isRegular,
        '世代': item.generation,
        '引种时间': item.time,
      }))
    );
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, '引种记录');
    XLSXWriteFile(wb, '引种记录.xlsx');
  };

  // 跳转到自交系纯化页面
  const handlePurification = (record: IntroductionRecord) => {
    Modal.confirm({
      title: '确认转入',
      content: `确定要将编号为 ${record.code} 的记录转入自交系纯化吗？`,
      onOk: () => {
        const purificationRecord = {
          ...record,
          key: Date.now(),
          status: '未完成',
          plantingCode: `P${Date.now()}`,
          sowingAmount: 0,
          planCode: '',
          sowingTime: new Date().toISOString().split('T')[0],
        };
        history.push('/purification', { purificationRecord });
        message.success('已转入自交系纯化');
      },
    });
  };

  const columns: ProColumns<IntroductionRecord>[] = [
    {
      title: '编号',
      dataIndex: 'code',
    },
    {
      title: '引种名称',
      dataIndex: 'name',
    },
    {
      title: '引种方式',
      dataIndex: 'method',
      valueEnum: {
        '购买': { text: '购买' },
        '交换': { text: '交换' },
        '赠送': { text: '赠送' },
        '其他': { text: '其他' },
      },
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      valueEnum: {
        '西瓜': { text: '西瓜' },
        '甜瓜': { text: '甜瓜' },
        '南瓜': { text: '南瓜' },
      },
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
      valueEnum: {
        '是': { text: '是' },
        '否': { text: '否' },
      },
    },
    {
      title: '世代',
      dataIndex: 'generation',
    },
    {
      title: '引种时间',
      dataIndex: 'time',
      valueType: 'date',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="sowing"
          type="link"
          onClick={() => handleSowing(record)}
        >
          播种
        </Button>,
        record.generation !== 'F1' && (
          <Button
            key="purification"
            type="link"
            onClick={() => handlePurification(record)}
          >
            转入自交系纯化
          </Button>
        ),
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
          onClick={() => {
            setDataSource(dataSource.filter(item => item.key !== record.key));
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<IntroductionRecord>
        headerTitle="引种记录"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Upload
            key="import"
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<ImportOutlined />}>导入</Button>
          </Upload>,
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>,
          <Button
            type="primary"
            key="add"
            onClick={() => {
              const newKey = (dataSource[dataSource.length - 1]?.key || 0) + 1;
              setDataSource([...dataSource, {
                key: newKey,
                code: `YZ${String(newKey).padStart(3, '0')}`,
                name: '',
                method: '购买',
                type: '西瓜',
                isRegular: '是',
                generation: 'F1',
                time: new Date().toISOString().split('T')[0],
              }]);
              setEditableKeys([newKey]);
            }}
          >
            <PlusOutlined /> 新增
          </Button>,
        ]}
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

      <Modal
        title="播种表"
        visible={sowingModalVisible}
        onCancel={() => {
          setSowingModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setSowingModalVisible(false);
            form.resetFields();
          }}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            生成考种记载表
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerateTestRecord}
        >
          <Form.Item
            label="种植编号"
            name="plantingCode"
            rules={[{ required: true, message: '请输入种植编号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="编号"
            name="code"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="品种名称"
            name="name"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="引种方式"
            name="method"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="品种类型"
            name="type"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="是否常规"
            name="isRegular"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="世代"
            name="generation"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="引种时间"
            name="introductionTime"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="播种数量"
            name="sowingAmount"
            rules={[{ required: true, message: '请输入播种数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="计划编号"
            name="planCode"
            rules={[{ required: true, message: '请输入计划编号' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default IntroductionList; 