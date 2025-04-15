//自交系纯化页面
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { useLocation, history } from '@umijs/max';
import { Button, Modal, message, Upload, Form, Input, InputNumber, DatePicker } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import moment from 'moment';

interface LocationState {
  purificationRecord?: PurificationRecord;
}

type PurificationRecord = {
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
};

const PurificationList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const location = useLocation();
  const [dataSource, setDataSource] = useState<PurificationRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sowingModalVisible, setSowingModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PurificationRecord | null>(null);
  const [form] = Form.useForm();

  // 从 localStorage 获取数据
  useEffect(() => {
    const savedData = localStorage.getItem('purificationRecords');
    if (savedData) {
      setDataSource(JSON.parse(savedData));
    }
  }, []);

  // 如果有新的自交系纯化记录，添加到数据源
  useEffect(() => {
    const state = location.state as LocationState;
    const { purificationRecord } = state || {};
    if (purificationRecord && !dataSource.some(item => item.key === purificationRecord.key)) {
      setDataSource(prev => [...prev, purificationRecord]);
    }
  }, [location.state]);

  // 数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('purificationRecords', JSON.stringify(dataSource));
  }, [dataSource]);

  // 处理单个删除
  const handleDelete = (record: PurificationRecord) => {
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

  // 处理播种
  const handleSowing = (record: PurificationRecord) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      sowingTime: record.sowingTime ? moment(record.sowingTime) : moment(),
    });
    setSowingModalVisible(true);
  };

  // 处理播种确认
  const handleSowingConfirm = async () => {
    try {
      const values = await form.validateFields();
      const sowingAmount = values.sowingAmount || 1;
      
      if (!currentRecord) {
        message.error('未找到当前记录');
        return;
      }

      // 从 localStorage 获取现有记录
      const savedSowingRecords = localStorage.getItem('purificationSowingRecords') || '[]';
      const existingSowingRecords = JSON.parse(savedSowingRecords);

      // 检查是否已存在相同种植编号的记录
      const hasExistingRecord = existingSowingRecords.some(
        (record: any) => record.plantingCode === currentRecord.plantingCode
      );

      if (hasExistingRecord) {
        message.warning('该记录已存在播种计划中');
        setSowingModalVisible(false);
        form.resetFields();
        return;
      }

      // 创建播种记录
      const baseTime = Date.now();
      const sowingRecords = Array(sowingAmount).fill(null).map((_, i) => ({
        ...currentRecord,
        key: baseTime + i,
        sowingAmount: 1,
        planCode: `P${baseTime + i}`,
        status: '未完成',
        sowingTime: values.sowingTime.format('YYYY-MM-DD'),
      }));

      // 保存到 localStorage
      const updatedSowingRecords = [...existingSowingRecords, ...sowingRecords];
      localStorage.setItem('purificationSowingRecords', JSON.stringify(updatedSowingRecords));

      // 跳转到播种计划页面
      history.push('/purification/sowing', { sowingRecords });
      message.success(`已成功生成${sowingAmount}条播种记录！`);
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
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newRecords: PurificationRecord[] = jsonData.map((row: any, index: number) => ({
          key: Date.now() + index,
          code: row['编号'] || '',
          name: row['品种名称'] || '',
          method: row['引种方式'] || '',
          type: row['品种类型'] || '',
          isRegular: row['是否常规'] || '',
          generation: row['世代'] || '',
          plantingCode: row['种植编号'] || `P${Date.now() + index}`,
          sowingAmount: Number(row['播种数量']) || 0,
          sowingTime: row['播种时间'] || new Date().toISOString().split('T')[0],
        }));

        setDataSource(prev => [...prev, ...newRecords]);
        message.success(`成功导入 ${newRecords.length} 条记录`);
      } catch (error) {
        message.error('导入失败，请检查文件格式是否正确');
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const columns: ProColumns<PurificationRecord>[] = [
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
      <ProTable<PurificationRecord>
        headerTitle="自交系纯化"
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
            <Button icon={<UploadOutlined />}>导入Excel</Button>
          </Upload>,
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

      {/* 播种弹窗 */}
      <Modal
        title="播种"
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
          <Button key="submit" type="primary" onClick={handleSowingConfirm}>
            播种
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            sowingAmount: 1,
          }}
        >
          <Form.Item
            name="plantingCode"
            label="种植编号"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="code"
            label="编号"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="name"
            label="品种名称"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="method"
            label="引种方式"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="type"
            label="品种类型"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="isRegular"
            label="是否常规"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="generation"
            label="世代"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="sowingAmount"
            label="播种数量"
            rules={[{ required: true, message: '请输入播种数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="sowingTime"
            label="播种时间"
            rules={[{ required: true, message: '请选择播种时间' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PurificationList; 