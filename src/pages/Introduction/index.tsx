//引种管理页面/引种记录
import { PageContainer, ProTable, ModalForm, ProFormText, ProFormSelect, ProFormDatePicker } from '@ant-design/pro-components';
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
  name: string;  // 引种名称
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
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 从 localStorage 获取初始数据
  const [dataSource, setDataSource] = useState<IntroductionRecord[]>(() => {
    // const savedData = localStorage.getItem('introductionRecords');
    // if (savedData) {
    //   return JSON.parse(savedData);
    // }
    return [

    ];
  });

  // 页面加载时从后端获取引种记录
  useEffect(() => {
    const fetchIntroductionRecords = async () => {
      try {
        const response = await fetch('/api/introduction/getIntroduction');
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setDataSource(result.data);
          console.log('获取引种记录:', result.data);
        } else {
          setDataSource([]);
        }
      } catch (error) {
        message.error('获取引种记录失败');
        setDataSource([]);
      }
    };
    fetchIntroductionRecords();
  }, []);

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
      const sowingAmount = values.sowingAmount || 1;
      // 创建播种表数据，包含所有字段
      const sowingTableData = {
        plantingCode: values.plantingCode,
        code: values.code,
        name: values.name,
        method: values.method,
        type: values.type,
        isRegular: values.isRegular,
        generation: values.generation,
        introductionTime: values.introductionTime,
        sowingAmount: values.sowingAmount,
        planCode: values.planCode,
        sowingTime: new Date().toISOString().split('T')[0],
      };
      // 发送到后端
      try {
        const response = await fetch('/api/introduction/sow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sowingTableData),
        });
        if (response.ok) {
          message.success('播种表已生成并保存到数据库');
          setSowingModalVisible(false);
          form.resetFields();
        } else {
          message.error('生成播种表失败');
        }
      } catch (error) {
        message.error('网络错误，请重试');
      }
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  // 处理Excel导入
  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/introduction/ExcelImport', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
        message.success('导入成功');
        // 导入成功后刷新数据
        const fetchRes = await fetch('/api/introduction/getIntroduction');
        const fetchJson = await fetchRes.json();
        if (Array.isArray(fetchJson.data)) {
          setDataSource(fetchJson.data);
        }
      } else {
        message.error(result?.msg || '导入失败');
      }
    } catch (error) {
      message.error('导入失败，请重试');
    }
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

  // 转入自交系纯化
  const handlePurification = async (record: IntroductionRecord) => {
    try {
      const response = await fetch('/api/introduction/purification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (response.ok) {
        message.success('转入自交系纯化成功');
      } else {
        message.error('转入自交系纯化失败');
      }
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
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这条记录吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                try {
                  const res = await fetch('/api/introduction/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: record.key }),
                  });
                  const result = await res.json();
                  if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
                    setDataSource(dataSource.filter(item => item.key !== record.key));
                    message.success('删除成功');
                  } else {
                    message.error(result?.msg || '删除失败');
                  }
                } catch (e) {
                  message.error('删除失败，请重试');
                }
              },
            });
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
            onClick={() => setCreateModalOpen(true)}
          >
            <PlusOutlined /> 新增
          </Button>,
        ]}
        dataSource={dataSource}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel],
          onSave: async (key, row, originRow, newLine) => {
            if (newLine) {
              // 新增保存
              try {
                const response = await fetch('/api/introduction/add', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(row),
                });
                if (response.ok) {
                  const newData = dataSource.map((item) =>
                    item.key === key ? { ...item, ...row } : item
                  );
                  setDataSource(newData);
                  message.success('新增成功');
                } else {
                  message.error('新增失败');
                }
              } catch (e) {
                message.error('新增失败');
              }
            } else {
              // 编辑保存
              try {
                const response = await fetch('/api/introduction/update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(row),
                });
                if (response.ok) {
                  const newData = dataSource.map((item) =>
                    item.key === key ? { ...item, ...row } : item
                  );
                  setDataSource(newData);
                  message.success('保存成功');
                } else {
                  message.error('保存失败');
                }
              } catch (e) {
                message.error('保存失败');
              }
            }
          },
          onCancel: (key, newLine) => {
            if (newLine) {
              setDataSource(dataSource.filter(item => item.key !== key));
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

      <ModalForm
        title="新增引种记录"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (values) => {
          try {
            const response = await fetch('/api/introduction/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            });
            if (response.ok) {
              message.success('新增成功');
              setCreateModalOpen(false);
              // 刷新表格
              const fetchRes = await fetch('/api/introduction/getIntroduction');
              const fetchJson = await fetchRes.json();
              if (Array.isArray(fetchJson.data)) {
                setDataSource(fetchJson.data);
              }
              return true;
            } else {
              message.error('新增失败');
              return false;
            }
          } catch (e) {
            message.error('新增失败');
            return false;
          }
        }}
      >
        <ProFormText name="code" label="编号" rules={[{ required: true, message: '请输入编号' }]} />
        <ProFormText name="name" label="引种名称" rules={[{ required: true, message: '请输入引种名称' }]} />
        <ProFormSelect name="method" label="引种方式" options={[{label:'购买',value:'购买'},{label:'交换',value:'交换'},{label:'赠送',value:'赠送'},{label:'其他',value:'其他'}]} rules={[{ required: true, message: '请选择引种方式' }]} />
        <ProFormSelect name="type" label="品种类型" options={[{label:'西瓜',value:'西瓜'},{label:'甜瓜',value:'甜瓜'},{label:'南瓜',value:'南瓜'}]} rules={[{ required: true, message: '请选择品种类型' }]} />
        <ProFormSelect name="isRegular" label="是否常规" options={[{label:'是',value:'是'},{label:'否',value:'否'}]} rules={[{ required: true, message: '请选择是否常规' }]} />
        <ProFormText name="generation" label="世代" rules={[{ required: true, message: '请输入世代' }]} />
        <ProFormDatePicker name="time" label="引种时间" rules={[{ required: true, message: '请选择引种时间' }]} fieldProps={{format:'YYYY-MM-DD'}} />
      </ModalForm>
    </PageContainer>
  );
};

export default IntroductionList; 
