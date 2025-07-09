// 播种计划
import { PageContainer, ProTable, ModalForm, ProFormDigit } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { useLocation } from '@umijs/max';
import { Button, Modal, message, Dropdown, Menu, Form } from 'antd';
import { DeleteOutlined, ExportOutlined, DownOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface LocationState {
  sowingRecord?: SowingRecord;
  sowingRecords?: SowingRecord[];
}

// SowingRecord类型加索引签名
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
  plantingcode: string;    // 种植编号
  sowingAmount: number;   // 播种数量
  sowingTime: string;    // 播种时间
  // 播种计划字段
  planCode: string;      // 计划编号
  status: string;        // 状态：未完成/已完成
  // recordIndex?: number;  // 记录索引，用于区分同一种子的不同记录
  [key: string]: any; // 允许任意key访问，解决类型报错
};

const SowingList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const location = useLocation();
  const [dataSource, setDataSource] = useState<SowingRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  // 页面加载时从后端获取自交系纯化播种计划数据
  useEffect(() => {
    const fetchPurificationSowingRecords = async () => {
      try {
        const response = await fetch('/api/Selfing/getSelfingSow');
        if (!response.ok) throw new Error('网络错误');
        const result = await response.json();
        console.log('获取自交系纯化播种计划数据:', result);
        if (Array.isArray(result.data)) {
          // 保证每条数据的key唯一，优先用id，否则用时间戳+随机数
          const withKey = result.data.map((item: any) => ({
            ...item,
            key: item.id ?? item.key ?? (Date.now() + Math.random()),
          }));
          setDataSource(withKey);
        } else {
          setDataSource([]);
        }
      } catch (error) {
        message.error('获取自交系纯化播种计划数据失败');
        setDataSource([]);
      }
    };
    fetchPurificationSowingRecords();
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

  // 查询表单的值
  const [searchValues, setSearchValues] = useState<any>({});
  // 本地过滤后的数据
  const [filteredData, setFilteredData] = useState<SowingRecord[]>([]);

  useEffect(() => {
    let result = dataSource;
    Object.entries(searchValues).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'sowingTime') {
        if (typeof value === 'string') {
          result = result.filter(item => (item.sowingTime || '').includes(value));
        }
      } else if (typeof value === 'string') {
        result = result.filter(item => (item[key] || '').toString().includes(value));
      } else {
        result = result.filter(item => item[key] === value);
      }
    });
    setFilteredData(result);
  }, [dataSource, searchValues]);

  // 处理单个删除
  const handleDelete = (record: SowingRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除种植编号为 ${record.plantingcode} 的记录吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`/api/Selfing/sowDelete?plantid=${record.plantingcode}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({ plantingcode: record.plantingcode }),
          });
          const result = await response.json();
          if (response.ok && result.success !== false) {
            const newDataSource = dataSource.filter(item => item.plantingcode !== record.plantingcode);
            setDataSource(newDataSource);
            message.success('删除成功');
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败，请重试');
        }
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
      onOk: async () => {
        try {
          const pedigreeNumbers = selectedRowKeys.map(key => {
            const row = dataSource.find(item => item.key === key);
            return row?.plantingcode;
          }).filter(Boolean);
          const response = await fetch('/api/Selfing/BatchDeleteSow', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keys: pedigreeNumbers }),
          });
          console.log('批量删除请求:', pedigreeNumbers);
          const result = await response.json();
          if (response.ok && result.success !== false) {
            message.success('批量删除成功');
            // 本地同步移除
            const newDataSource = dataSource.filter(
              item => !selectedRowKeys.includes(item.key)
            );
            setDataSource(newDataSource);
            setSelectedRowKeys([]);
          } else {
            message.error(result.message || '批量删除失败');
          }
        } catch (error) {
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  // 处理生成考种记载表
  const handleGenerateExamRecords = async (record: any, count: number) => {
    try {
      // 显示加载提示
      const hide = message.loading('正在生成考种记载表...');

      // 准备发送到后端的数据
      const examData = {
        plantingCode: record.plantingcode, // 系谱编号
        code: record.code,                 // 编号
        varietyName: record.name,          // 品种名称
        // sowingCount: record.sowingAmount,  // 播种数量
        // planNumber: record.planCode,       // 计划编号
        createTime: record.sowingTime,     // 播种时间
        generateCount: count,
        method: record.method,             // 引种方式
        type: record.type,                 // 品种类型
        isRegular: record.isRegular,       // 是否常规
        generation: record.generation      // 世代
      };
      console.log('Sending exam data:', examData);

      console.log('准备发送考种记载表数据:', examData);

      // 发送数据到后端
      const response = await fetch('/api/Selfing/examination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        throw new Error('生成考种记载表失败');
      }

      const result = await response.json();
      console.log('后端返回的考种记载表数据:', result.data);
      const newRecords = Array.isArray(result.data) ? result.data : [];
      const existingRecords = localStorage.getItem('examRecords');
      const allRecords = existingRecords ? JSON.parse(existingRecords) : [];
      allRecords.push(...newRecords);
      localStorage.setItem('examRecords', JSON.stringify(allRecords));

      // 隐藏加载提示
      hide();
      message.success('已生成考种记载表');

      // 关闭模态框
      setIsModalVisible(false);
      setCurrentRecord(null);

      // 跳转到考种记载表页面
      // history.push('/purification/test-records');

    } catch (error) {
      message.error('生成考种记载表失败，请重试');
      console.error('Error generating exam records:', error);
    }
  };

  // 处理导出本模块数据
  const handleExportCurrent = () => {
    if (dataSource.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    // 准备导出数据
    const exportData = dataSource.map(item => ({
      '种植编号': item.plantingcode,
      '编号': item.code,
      '品种名称': item.varietyName,
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

  // 处理导出所有记录
  const handleExportAllRecords = () => {
    const allRecords: any[] = [];

    // 获取种质资源记录
    const sowingRecords = localStorage.getItem('sowingRecords');
    if (sowingRecords) {
      const records = JSON.parse(sowingRecords);
      allRecords.push(...records.map((item: any) => ({
        '种植编号': item.code,
        '编号': item.seedNumber,
        '品种名称': item.varietyName,
        '播种数量': item.sowingCount,
        '计划编号': item.planNumber,
        '创建时间': item.createTime,
        '来源': '种质资源'
      })));
      // 添加空行
      allRecords.push({});
    }

    // 获取引种模块记录
    const introductionSowingRecords = localStorage.getItem('sowingRecords');
    if (introductionSowingRecords) {
      const records = JSON.parse(introductionSowingRecords);
      allRecords.push(...records.map((item: any) => ({
        '种植编号': item.code,
        '编号': item.seedNumber,
        '品种名称': item.varietyName,
        '播种数量': item.sowingCount,
        '计划编号': item.planNumber,
        '创建时间': item.createTime,
        '来源': '引种模块'
      })));
      // 添加空行
      allRecords.push({});
    }

    // 获取自交系纯化记录
    allRecords.push(...dataSource.map(item => ({
      '系谱编号': item.plantingCode,
      '编号': item.code,
      '品种名称': item.varietyName,
      '引种方式': item.method,
      '品种类型': item.type,
      '是否常规': item.isRegular,
      '世代': item.generation,
      '播种数量': item.sowingAmount,
      '播种时间': item.sowingTime,
      '计划编号': item.planCode,
      '状态': item.status,
      '来源': '自交系纯化'
    })));

    if (allRecords.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(allRecords);

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 种植编号
      { wch: 15 }, // 编号
      { wch: 20 }, // 品种名称
      { wch: 10 }, // 播种数量
      { wch: 15 }, // 计划编号
      { wch: 20 }, // 创建时间
      { wch: 10 }, // 来源
    ];
    ws['!cols'] = colWidths;

    // 设置单元格样式
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    let currentSource = '';
    let startRow = 1; // 从1开始，因为0是表头

    // 遍历所有行
    for (let R = range.s.r; R <= range.e.r; R++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: 6 })]; // 来源列
      if (cell && cell.v) {
        if (cell.v !== currentSource) {
          // 设置新来源的标题行样式
          const titleCell = ws[XLSX.utils.encode_cell({ r: R, c: 0 })];
          if (titleCell) {
            titleCell.s = {
              fill: {
                fgColor: { rgb: getSourceColor(cell.v) }
              },
              font: {
                bold: true,
                color: { rgb: 'FFFFFF' }
              }
            };
          }
          currentSource = cell.v;
        }
        // 设置数据行样式
        for (let C = range.s.c; C <= range.e.c; C++) {
          const dataCell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (dataCell) {
            dataCell.s = {
              fill: {
                fgColor: { rgb: getSourceColor(cell.v) }
              }
            };
          }
        }
      }
    }

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '全部记录');

    // 生成Excel文件
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `全部记录_${new Date().toLocaleDateString()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('导出成功');
  };

  // 处理全部导出
  const handleExportAll = (module: string) => {
    if (module === '全部') {
      handleExportAllRecords();
      return;
    }

    let exportData: any[] = [];
    let fileName = '';

    switch (module) {
      case '种质资源':
        const sowingRecords = localStorage.getItem('sowingRecords');
        if (sowingRecords) {
          const records = JSON.parse(sowingRecords);
          exportData = records.map((item: any) => ({
            '种植编号': item.code,
            '编号': item.code,
            '品种名称': item.varietyName,
            '播种数量': item.sowingCount,
            '计划编号': item.planNumber,
            '创建时间': item.createTime,
            '来源': '种质资源'
          }));
        }
        fileName = '种质资源记录';
        break;
      case '引种模块':
        const introductionSowingRecords = localStorage.getItem('sowingRecords');
        if (introductionSowingRecords) {
          const records = JSON.parse(introductionSowingRecords);
          exportData = records.map((item: any) => ({
            '种植编号': item.code,
            '编号': item.seedNumber,
            '品种名称': item.varietyName,
            '播种数量': item.sowingCount,
            '计划编号': item.planNumber,
            '创建时间': item.createTime,
            '来源': '引种模块'
          }));
        }
        fileName = '引种记录';
        break;
      case '自交系纯化':
        exportData = dataSource.map(item => ({
          '种植编号': item.plantingCode,
          '编号': item.code,
          '品种名称': item.varietyName,
          '引种方式': item.method,
          '品种类型': item.type,
          '是否常规': item.isRegular,
          '世代': item.generation,
          '播种数量': item.sowingAmount,
          '播种时间': item.sowingTime,
          '计划编号': item.planCode,
          '状态': item.status,
          '来源': '自交系纯化'
        }));
        fileName = '自交系纯化记录';
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

  // 获取不同来源的颜色
  const getSourceColor = (source: string): string => {
    switch (source) {
      case '种质资源':
        return 'FFB6C1'; // 浅粉色
      case '引种模块':
        return '98FB98'; // 浅绿色
      case '自交系纯化':
        return '87CEEB'; // 浅蓝色
      default:
        return 'FFFFFF'; // 白色
    }
  };

  // 创建导出菜单
  const exportMenu = (
    <Menu onClick={({ key }) => handleExportAll(key)}>
      <Menu.Item key="全部">全部</Menu.Item>
      <Menu.Item key="种质资源">种质资源</Menu.Item>
      <Menu.Item key="引种模块">引种模块</Menu.Item>
      <Menu.Item key="自交系纯化">自交系纯化</Menu.Item>
    </Menu>
  );

  // 编辑保存
  const handleSave = async (row: SowingRecord) => {
    try {
      const response = await fetch('/api/Selfing/editSow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      });
      const result = await response.json();
      if (response.ok && result.success !== false) {
        const newData = dataSource.map((item) => (item.key === row.key ? { ...item, ...row } : item));
        setDataSource(newData);
        message.success('保存成功');
        return true;
      } else {
        message.error(result.message || '保存失败');
        return false;
      }
    } catch (error) {
      message.error('保存失败，请重试');
      return false;
    }
  };

  const columns: ProColumns<SowingRecord>[] = [
    {
      title: '系谱编号',
      dataIndex: 'plantingcode',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '编号',
      dataIndex: 'code',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '品种名称',
      dataIndex: 'name',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '引种方式',
      dataIndex: 'method',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '品种类型',
      dataIndex: 'type',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '是否常规',
      dataIndex: 'isRegular',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '世代',
      dataIndex: 'generation',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '播种时间',
      dataIndex: 'sowingTime',
      valueType: 'date',
      hideInTable: false,
      hideInSearch: false,
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   valueEnum: {
    //     '未完成': { text: '未完成', status: 'Default' },
    //     '已完成': { text: '已完成', status: 'Success' },
    //   },
    //   hideInTable: false,
    //   hideInSearch: false,
    // },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, index, action) => [
        <a
          key="edit"
          onClick={() => action?.startEditable?.(record.key)}
        >
          编辑
        </a>,
        <Button
          key="generate"
          type="link"
          onClick={() => {
            setCurrentRecord(record);
            setIsModalVisible(true);
          }}
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
    <>
      <PageContainer>
        <ProTable<SowingRecord>
          headerTitle="播种计划"
          actionRef={actionRef}
          rowKey="key"
          search={{
            labelWidth: 120,
          }}
          form={{
            onValuesChange: (_: any, all: any) => setSearchValues(all),
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
          dataSource={filteredData}
          columns={columns}
          editable={{
            type: 'single',
            onSave: async (_, row) => handleSave(row),
          }}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </PageContainer>
      
      <ModalForm
        title="生成考种记载表"
        open={isModalVisible}
        form={form}
        autoFocusFirstInput
        modalProps={{
          onCancel: () => {
            setIsModalVisible(false);
            form.resetFields();
          },
        }}
        onFinish={async (values) => {
          if (currentRecord) {
            await handleGenerateExamRecords(currentRecord, values.quantity);
          }
          setIsModalVisible(false);
          form.resetFields();
          return true;
        }}
      >
        <ProFormDigit
          name="quantity"
          label="生成数量"
          rules={[{ required: true, message: '请输入生成数量' }]}
        />
      </ModalForm>
    </>
  );
};

export default SowingList; 