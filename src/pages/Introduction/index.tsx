//引种管理页面/引种记录
import { PageContainer, ProTable, ModalForm, ProFormText, ProFormSelect, ProFormDatePicker } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { Button, message, Upload, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';

// 定义表格数据类型
type IntroductionRecord = {
  key: number;
  code: string;  // 编号
  name: string;  // 引种名称
  method: string; // 引种方式
  type: string;  // 品种类型
  isRegular: string; // 是否常规
  generation: string;  // 世代
  introductionTime: string;
  plantingCode: string; // 种植编号
  // 引种时间
};

const IntroductionList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const [sowingModalVisible, setSowingModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<IntroductionRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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
          setFilteredData(result.data); // 初始化filteredData
          console.log('获取引种记录:', result.data);
        } else {
          setDataSource([]);
          setFilteredData([]);
        }
      } catch (error) {
        message.error('获取引种记录失败');
        setDataSource([]);
        setFilteredData([]);
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
      introductionTime: record.introductionTime,
    });
  };

  // 处理生成考种记载表
  const handleGenerateTestRecord = async () => {
    try {
      const values = await form.validateFields();
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
        '引种时间': item.introductionTime,
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
      // console.log('转入自交系纯化请求:', record);
      if (response.ok) {
        message.success('转入自交系纯化成功');
      } else {
        message.error('转入自交系纯化失败');
      }
    } catch (e) {
      message.error('转入失败');
    }
  };

  // 批量删除
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
          // const plantids = JSON.stringify({ plantids: selectedRowKeys })
          try {
            const res = await fetch('/api/introduction/BatchDeleteIntroduction', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keys: selectedRowKeys }),
            });
            console.log('批量删除请求:', JSON.stringify({ keys: selectedRowKeys }));
            const result = await res.json();
            if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
              setDataSource(dataSource.filter(item => !selectedRowKeys.includes(item.plantingCode)));
              setFilteredData(filteredData.filter(item => !selectedRowKeys.includes(item.plantingCode)));
              setSelectedRowKeys([]);
              message.success(`已删除 ${selectedRowKeys.length} 条记录`);
            } else {
              message.error(result?.msg || '批量删除失败');
            }
          } catch (e) {
            message.error('批量删除失败，请重试');
          }
        },
      });
    };

  // dataSource变化时同步filteredData
  useEffect(() => {
    setFilteredData(dataSource);
  }, [dataSource]);

  // 实时查询：监听ProTable表单变化，实时过滤
  const handleValuesChange = (_: any, all: any) => {
    let result = dataSource;
    if (all.code) result = result.filter(item => (item.code ?? '').toString().includes(all.code));
    if (all.name) result = result.filter(item => (item.name ?? '').toString().includes(all.name));
    if (all.method) result = result.filter(item => item.method === all.method);
    if (all.type) result = result.filter(item => item.type === all.type);
    if (all.isRegular) result = result.filter(item => item.isRegular === all.isRegular);
    if (all.generation) result = result.filter(item => (item.generation ?? '').toString().includes(all.generation));
    if (all.introductionTime) {
      // 日期字段支持模糊匹配
      const val = typeof all.introductionTime === 'string' ? all.introductionTime : (all.introductionTime?.format?.('YYYY-MM-DD') ?? '');
      result = result.filter(item => (item.introductionTime ?? '').includes(val));
    }
    setFilteredData(result);
  };

  const columns: ProColumns<IntroductionRecord>[] = [
    {
      title: '编号',
      dataIndex: 'code',
      editable: false, // 编号不可编辑
    },
    {
      title: '引种名称',
      dataIndex: 'name',
      editable: () => true,
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
      editable: () => true,
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      valueEnum: {
        '西瓜': { text: '西瓜' },
        '甜瓜': { text: '甜瓜' },
        '南瓜': { text: '南瓜' },
      },
      editable: () => true,
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
      valueEnum: {
        '是': { text: '是' },
        '否': { text: '否' },
      },
      editable: () => true,
    },
    {
      title: '世代',
      dataIndex: 'generation',
      editable: () => true,
    },
    {
      title: '引种时间',
      dataIndex: 'introductionTime',
      valueType: 'date',
      editable: () => true,
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
            setEditableKeys([record.plantingCode]);
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
                  const res = await fetch(`/api/introduction/introductionDelete?plantid=${record.plantingCode}`, {
                    method: 'DELETE',
                  });
                  const result = await res.json();
                  if (result && (result.success || result.code === 200 || result.msg === 'SUCCESS')) {
                    setDataSource(dataSource.filter(item => item.plantingCode !== record.plantingCode));
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
        rowKey="plantingCode"
        search={{
          labelWidth: 120,
        }}
        form={{
          onValuesChange: handleValuesChange,
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
          <Button
            key="batchDelete"
            danger
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
       
        dataSource={filteredData}
        // onSubmit={handleSearch} // 已用onValuesChange实时过滤，无需onSubmit
        onReset={() => setFilteredData(dataSource)}
        editable={{
          type: 'single',
          editableKeys,
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel],
          onSave: async (_code, row) => {
            // 只处理编辑保存
            try {
              const response = await fetch('/api/introduction/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(row),
              });
              if (response.ok) {
                message.success('保存成功');
                // 保存成功后刷新数据
                const fetchRes = await fetch('/api/introduction/getIntroduction');
                const fetchJson = await fetchRes.json();
                if (Array.isArray(fetchJson.data)) {
                  setDataSource(fetchJson.data);
                  setFilteredData(fetchJson.data);
                }
              } else {
                message.error('保存失败');
              }
            } catch (e) {
              message.error('保存失败');
            }
          },
          onCancel: async () => {},
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
            const response = await fetch('/api/introduction/introductionAdd', {
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
