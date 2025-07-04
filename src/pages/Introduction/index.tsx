//引种管理页面/引种记录
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
  plantingCode: string;// 种植编号
  code: string;      // 编号
  name: string; // 品种名称
  sowingAmount: number;  // 播种数量
  planCode: string; // 计划编号
};

// 定义表格数据类型
type IntroductionRecord = {
  key: number;
  code: string;  // 编号
  varietyName: string;  // 引种名称
  method: string; // 引种方式
  type: string;  // 品种类型
  isRegular: string; // 是否常规
  generation: string;  // 世代
  time: string;  // 引种时间
};

const IntroductionList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const [sowingModalVisible, setSowingModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IntroductionRecord | null>(null);
  const [form] = Form.useForm();

  // 从 localStorage 获取初始数据
  const [dataSource, setDataSource] = useState<IntroductionRecord[]>(() => {
    // const savedData = localStorage.getItem('introductionRecords');
    // if (savedData) {
    //   return JSON.parse(savedData);
    // }
    return [
      {
        key: 1,
        code: 'YZ001',
        varietyName: '京欣1号',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F2',
        time: '2024-03-15',
      },
      {
        key: 2,
        code: 'YZ002',
        varietyName: '甜王2号',
        method: '交换',
        type: '甜瓜',
        isRegular: '否',
        generation: 'F1',
        time: '2024-03-16',
      },
      {
        key: 3,
        code: 'YZ003',
        varietyName: '金玉3号',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F2',
        time: '2024-03-17',
      },
      {
        key: 4,
        code: 'YZ004',
        varietyName: '蜜宝4号',
        method: '赠送',
        type: '甜瓜',
        isRegular: '否',
        generation: 'F3',
        time: '2024-03-18',
      },
      {
        key: 5,
        code: 'YZ005',
        varietyName: '南瓜王',
        method: '购买',
        type: '南瓜',
        isRegular: '是',
        generation: 'F1',
        time: '2024-03-19',
      },
      {
        key: 6,
        code: 'YZ006',
        varietyName: '甜蜜红玉',
        method: '交换',
        type: '西瓜',
        isRegular: '否',
        generation: 'F2',
        time: '2024-03-20',
      },
      {
        key: 7,
        code: 'YZ007',
        varietyName: '金瓜5号',
        method: '购买',
        type: '南瓜',
        isRegular: '是',
        generation: 'F3',
        time: '2024-03-21',
      },
      {
        key: 8,
        code: 'YZ008',
        varietyName: '蜜瓜皇后',
        method: '赠送',
        type: '甜瓜',
        isRegular: '否',
        generation: 'F2',
        time: '2024-03-22',
      },
      {
        key: 9,
        code: 'YZ009',
        varietyName: '翠玉6号',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F1',
        time: '2024-03-23',
      },
      {
        key: 10,
        code: 'YZ010',
        varietyName: '金冠7号',
        method: '交换',
        type: '南瓜',
        isRegular: '否',
        generation: 'F2',
        time: '2024-03-24',
      },
      {
        key: 11,
        code: 'YZ011',
        varietyName: '红心甜王',
        method: '购买',
        type: '西瓜',
        isRegular: '是',
        generation: 'F3',
        time: '2024-03-25',
      },
      {
        key: 12,
        code: 'YZ012',
        varietyName: '蜜瓜新秀',
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
      name: record.varietyName,
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
      const sowingAmount = values.sowingAmount || 1;

      // 创建多个播种记录，数量等于用户输入的播种数量
      const sowingRecords = [];
      for (let i = 0; i < sowingAmount; i++) {
        const sowingRecord = {
          ...values,
          key: Date.now() + i,
          sowingTime: new Date().toISOString().split('T')[0],
          status: '未生成考种记录',
          recordIndex: i + 1, // 添加记录索引，用于区分同一种子的不同记录
        };
        sowingRecords.push(sowingRecord);
      }

      // 保存播种记录到 localStorage
      const savedSowingRecords = localStorage.getItem('sowingRecords') || '[]';
      const existingSowingRecords = JSON.parse(savedSowingRecords);
      const updatedSowingRecords = [...existingSowingRecords, ...sowingRecords];
      localStorage.setItem('sowingRecords', JSON.stringify(updatedSowingRecords));

      // 跳转到播种记录页面
      history.push('/introduction/sowing', { sowingRecords });
      message.success(`已成功生成${sowingAmount}条播种记录！`);
      setSowingModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  // 处理Excel导入
  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      // 假设后端接口为 /api/import-introduction，返回格式为 { data: IntroductionRecord[] }
      const response = await fetch('api/introduction/ExcelImport', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log(result);
      if (result && Array.isArray(result.data)) {
        // 自动生成key，拼接到现有数据
        const newData = result.data.map((item: any, idx: number) => ({
          ...item,
          key: dataSource.length + idx + 1,
        }));
        setDataSource([...dataSource, ...newData]);
        message.success('导入成功');
      } else {
        message.error('导入失败，后端未返回有效数据');
      }
    } catch (error) {
      message.error('导入失败，请重试');
      console.log('导入错误:', error);
    }
    return false;
  };

  // 处理Excel导出
  const handleExport = () => {
    const ws = XLSXUtils.json_to_sheet(
      dataSource.map(item => ({
        '编号': item.code,
        '引种名称': item.varietyName,
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

  // 转入自交系纯化
  const handlePurification = async (record: IntroductionRecord) => {
    try {
      const response = await fetch('/api/introduction/purification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      console.log(JSON.stringify(record));
      const result = await response.json();
      // if (!Array.isArray(result.data)) {
      //   message.error('后端未返回有效数组');
      //   return;
      // }
      console.log(result.data);
      // 追加到 localStorage
      const existing = localStorage.getItem('purificationRecords');
      const purificationRecords = existing ? JSON.parse(existing) : [];
      const baseKey = Date.now();
      const newRecords = result.data.map((item, idx) => ({
        ...item,
        key: baseKey + idx,
      }));
      const updated = [...purificationRecords, ...newRecords];
      localStorage.setItem('purificationRecords', JSON.stringify(updated));
      message.success('转入自交系纯化成功');
    } catch (e) {
      message.error('转入失败');
    }
  };

  const columns: ProColumns<IntroductionRecord>[] = [
    {
      title: '编号',
      dataIndex: 'code',
    },
    {
      title: '引种名称',
      dataIndex: 'varietyName',
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
      ].filter(Boolean),
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
            生成播种表
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
            name="varietyName"
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
