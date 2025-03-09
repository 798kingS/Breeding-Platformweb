import { removeRule, rule, updateRule, saveSeed, importExcel } from '@/services/ant-design-pro/api';
import { mockData } from '@/services/ant-design-pro/api';
import { PlusOutlined, ImportOutlined, UploadOutlined, ExportOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProTable,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Drawer, message, Upload, Modal, Table, Space } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    // 生成一个新的key
    const newKey = mockData.length + 1;
    const newRecord = {
      ...fields,
      key: newKey,
    };
    
    // 添加到mockData
    mockData.push(newRecord);
    
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败，请重试！');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
// 定义一个异步函数handleUpdate，用于更新规则
const handleUpdate = async (fields: FormValueType) => {
  // 显示加载中提示
  const hide = message.loading('Configuring');
  try {
    // 调用updateRule函数，传入fields参数，更新规则
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    // 隐藏加载中提示
    hide();

    // 显示配置成功的提示
    message.success('Configuration is successful');
    return true;
  } catch (error) {
    // 隐藏加载中提示
    hide();
    // 显示配置失败的提示
    message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
    return false;
  }
};

/**
 * 处理留种操作
 * @param record 当前行数据
 */
const handleSaveSeed = async (record: API.RuleListItem) => {
  const hide = message.loading('正在保存到留种页面');
  try {
    if (!record.varietyName || !record.type || !record.seedNumber || 
        !record.photo || !record.source || !record.plantingYear) {
      message.error('缺少必要的种子信息');
      return false;
    }
    
    await saveSeed({
      varietyName: record.varietyName,
      type: record.type,
      seedNumber: record.seedNumber,
      photo: record.photo,
      source: record.source,
      plantingYear: record.plantingYear,
    });
    hide();
    message.success('已成功保存到留种页面');
    return true;
  } catch (error) {
    hide();
    message.error('保存失败，请重试！');
    return false;
  }
};

/**
 * 批量留种操作
 * @param selectedRows 选中的行数据
 */
const handleBatchSave = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在批量保存到留种页面');
  if (!selectedRows) return true;
  try {
    for (const record of selectedRows) {
      if (!record.varietyName || !record.type || !record.seedNumber || 
          !record.photo || !record.source || !record.plantingYear) {
        message.error(`品种"${record.varietyName || '未知'}"缺少必要的种子信息`);
        continue;
      }
      
      await saveSeed({
        varietyName: record.varietyName,
        type: record.type,
        seedNumber: record.seedNumber,
        photo: record.photo,
        source: record.source,
        plantingYear: record.plantingYear,
      });
    }
    hide();
    message.success('批量保存成功');
    return true;
  } catch (error) {
    hide();
    message.error('批量保存失败，请重试');
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [importModalOpen, handleImportModalOpen] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const [hybridModalOpen, setHybridModalOpen] = useState<boolean>(false);
  const [currentVariety, setCurrentVariety] = useState<API.RuleListItem>();
  const [hybridizationList, setHybridizationList] = useState<any[]>([]);

  const handleShowHybridization = (record: API.RuleListItem) => {
    setCurrentVariety(record);
    setHybridModalOpen(true);
  };

  const handleCreateHybridization = (targetVariety: API.RuleListItem) => {
    if (!currentVariety || !targetVariety) return;
    
    const newHybrid = {
      id: `${currentVariety.seedNumber}X${targetVariety.seedNumber}`,
      femaleNumber: currentVariety.seedNumber,
      maleNumber: targetVariety.seedNumber,
      femaleName: currentVariety.varietyName,
      maleName: targetVariety.varietyName,
    };
    
    setHybridizationList([...hybridizationList, newHybrid]);
    message.success('已添加到杂交配组表');
  };

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 80,
      search: false,
      sorter: (a, b) => (a.key || 0) - (b.key || 0),
    },
    {
      title: '照片',
      dataIndex: 'photo',
      valueType: 'image',
      search: false,
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
      valueType: 'text',
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'text',
      valueEnum: {
        '西瓜': { text: '西瓜' },
        '甜瓜': { text: '甜瓜' },
        '南瓜': { text: '南瓜' },
        '黄瓜': { text: '黄瓜' },
      },
      sorter: (a, b) => (a.type || '').localeCompare(b.type || ''),
    },
    {
      title: '引种年份',
      dataIndex: 'introductionYear',
      valueType: 'dateYear',
      sorter: (a, b) => (a.introductionYear || '').localeCompare(b.introductionYear || ''),
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueType: 'text',
    },
    {
      title: '常规种/纯化',
      dataIndex: 'breedingType',
      valueType: 'select',
      valueEnum: {
        regular: { text: '常规种' },
        pure: { text: '纯化' },
      },
    },
    {
      title: '留种编号',
      dataIndex: 'seedNumber',
      valueType: 'text',
    },
    {
      title: '种植年份',
      dataIndex: 'plantingYear',
      valueType: 'dateYear',
      sorter: (a, b) => (a.plantingYear || '').localeCompare(b.plantingYear || ''),
    },
    {
      title: '抗性',
      dataIndex: 'resistance',
      valueType: 'text',
    },
    {
      title: '结果特征',
      dataIndex: 'fruitCharacteristics',
      valueType: 'text',
    },
    {
      title: '开花期/果实发育期',
      dataIndex: 'floweringPeriod',
      valueType: 'text',
    },
    {
      title: '留果个数',
      dataIndex: 'fruitCount',
      valueType: 'digit',
      search: {
        transform: (value) => ({ fruitCountMin: value[0], fruitCountMax: value[1] }),
      },
    },
    {
      title: '产量',
      dataIndex: 'yield',
      valueType: 'digit',
      search: {
        transform: (value) => ({ yieldMin: value[0], yieldMax: value[1] }),
      },
      sorter: (a, b) => (a.yield || 0) - (b.yield || 0),
    },
    {
      title: '果型',
      dataIndex: 'fruitShape',
      valueType: 'text',
    },
    {
      title: '皮色',
      dataIndex: 'skinColor',
      valueType: 'text',
    },
    {
      title: '肉色',
      dataIndex: 'fleshColor',
      valueType: 'text',
    },
    {
      title: '单果重',
      dataIndex: 'singleFruitWeight',
      valueType: 'digit',
      fieldProps: {
        suffix: 'g',
      },
      search: {
        transform: (value) => ({ weightMin: value[0], weightMax: value[1] }),
      },
    },
    {
      title: '肉厚',
      dataIndex: 'fleshThickness',
      valueType: 'digit',
      fieldProps: {
        suffix: 'mm',
      },
      search: {
        transform: (value) => ({ thicknessMin: value[0], thicknessMax: value[1] }),
      },
    },
    {
      title: '糖度',
      dataIndex: 'sugarContent',
      valueType: 'digit',
      fieldProps: {
        suffix: '°Brix',
      },
      search: {
        transform: (value) => ({ sugarMin: value[0], sugarMax: value[1] }),
      },
    },
    {
      title: '质地',
      dataIndex: 'texture',
      valueType: 'text',
    },
    {
      title: '总体口感',
      dataIndex: 'overallTaste',
      valueType: 'text',
    },
    {
      title: '配合力',
      dataIndex: 'combiningAbility',
      valueType: 'text',
      sorter: (a, b) => (a.combiningAbility || '').localeCompare(b.combiningAbility || ''),
    },
    {
      title: '杂交情况',
      dataIndex: 'hybridizationStatus',
      valueType: 'text',
      render: (_, record) => {
        if (record.parentMale && record.parentFemale) {
          return `${record.parentFemale}*${record.parentMale}`;
        }
        return (
          <Button
            type="link"
            onClick={() => handleShowHybridization(record)}
          >
            尚未杂交
          </Button>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button
          key="save"
          type="primary"
          onClick={() => {
            handleSaveSeed(record);
          }}
        >
          留种
        </Button>
      ],
    },
  ];

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error('请选择要上传的Excel文件');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files[]', file);
    });

    setUploading(true);

    try {
      const response = await importExcel(formData);
      if (response.success) {
        message.success('导入成功');
        handleImportModalOpen(false);
        setFileList([]);
        // 刷新表格数据
        if (actionRef.current) {
          actionRef.current.reload();
        }
        // 如果是模拟数据，可以直接添加到mockData
        if (response.data) {
          mockData.push(...response.data);
        }
      } else {
        message.error(response.message || '导入失败');
      }
    } catch (error) {
      message.error('导入失败，请重试');
    }

    setUploading(false);
  };

  const uploadProps = {
    onRemove: (file: any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: any) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error('只能上传Excel文件！');
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const handleExportHybridization = () => {
    if (hybridizationList.length === 0) {
      message.warning('暂无杂交配组数据');
      return;
    }

    // 创建CSV内容
    const headers = ['编号', '母本编号', '父本编号', '母本名称', '父本名称'];
    const csvContent = [
      headers.join(','),
      ...hybridizationList.map(item => 
        [item.id, item.femaleNumber, item.maleNumber, item.femaleName, item.maleName].join(',')
      )
    ].join('\n');

    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '杂交配组表.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.ku',
          defaultMessage: '种质资源库',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
          defaultCollapsed: true,
          collapsed: false,
        }}
        toolBarRender={() => [
          <Button
            key="import"
            type="primary"
            onClick={() => {
              handleImportModalOpen(true);
            }}
            icon={<ImportOutlined />}
          >
            导入Excel
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> 新增
          </Button>,
        ]}
        request={rule}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
          ],
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a style={{ fontWeight: 600, color: '#1890ff' }}>{selectedRowsState.length}</a>{' '}
              个品种
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              await handleBatchSave(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量留种
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title="新增品种"
        width="800px"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.RuleListItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          label="品种名称"
          rules={[
            {
              required: true,
              message: '品种名称为必填项',
            },
          ]}
          width="md"
          name="varietyName"
        />
        <ProFormSelect
          label="类型"
          rules={[
            {
              required: true,
              message: '类型为必填项',
            },
          ]}
          width="md"
          name="type"
          options={[
            { label: '西瓜', value: '西瓜' },
            { label: '甜瓜', value: '甜瓜' },
            { label: '南瓜', value: '南瓜' },
            { label: '黄瓜', value: '黄瓜' },
          ]}
        />
        <ProFormText
          label="照片URL"
          rules={[
            {
              required: true,
              message: '照片URL为必填项',
            },
          ]}
          width="md"
          name="photo"
        />
        <ProFormDatePicker
          label="引种年份"
          rules={[
            {
              required: true,
              message: '引种年份为必填项',
            },
          ]}
          width="md"
          name="introductionYear"
          fieldProps={{
            picker: 'year',
          }}
        />
        <ProFormText
          label="来源"
          rules={[
            {
              required: true,
              message: '来源为必填项',
            },
          ]}
          width="md"
          name="source"
        />
        <ProFormSelect
          label="常规种/纯化"
          rules={[
            {
              required: true,
              message: '常规种/纯化为必填项',
            },
          ]}
          width="md"
          name="breedingType"
          options={[
            { label: '常规种', value: 'regular' },
            { label: '纯化', value: 'pure' },
          ]}
        />
        <ProFormText
          label="留种编号"
          rules={[
            {
              required: true,
              message: '留种编号为必填项',
            },
          ]}
          width="md"
          name="seedNumber"
        />
        <ProFormDatePicker
          label="种植年份"
          rules={[
            {
              required: true,
              message: '种植年份为必填项',
            },
          ]}
          width="md"
          name="plantingYear"
          fieldProps={{
            picker: 'year',
          }}
        />
        <ProFormText
          label="抗性"
          width="md"
          name="resistance"
        />
        <ProFormText
          label="结果特征"
          width="md"
          name="fruitCharacteristics"
        />
        <ProFormText
          label="开花期/果实发育期"
          width="md"
          name="floweringPeriod"
        />
        <ProFormDigit
          label="留果个数"
          width="md"
          name="fruitCount"
          min={0}
        />
        <ProFormDigit
          label="产量"
          width="md"
          name="yield"
          min={0}
        />
        <ProFormText
          label="果型"
          width="md"
          name="fruitShape"
        />
        <ProFormText
          label="皮色"
          width="md"
          name="skinColor"
        />
        <ProFormText
          label="肉色"
          width="md"
          name="fleshColor"
        />
        <ProFormDigit
          label="单果重(g)"
          width="md"
          name="singleFruitWeight"
          min={0}
        />
        <ProFormDigit
          label="肉厚(mm)"
          width="md"
          name="fleshThickness"
          min={0}
        />
        <ProFormDigit
          label="糖度(°Brix)"
          width="md"
          name="sugarContent"
          min={0}
        />
        <ProFormText
          label="质地"
          width="md"
          name="texture"
        />
        <ProFormText
          label="总体口感"
          width="md"
          name="overallTaste"
        />
        <ProFormText
          label="配合力"
          width="md"
          name="combiningAbility"
        />
        <ProFormText
          label="父本"
          width="md"
          name="parentMale"
        />
        <ProFormText
          label="母本"
          width="md"
          name="parentFemale"
        />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer>

      <Modal
        title="导入Excel"
        open={importModalOpen}
        onOk={handleImport}
        onCancel={() => {
          handleImportModalOpen(false);
          setFileList([]);
        }}
        confirmLoading={uploading}
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>选择Excel文件</Button>
        </Upload>
        <div style={{ marginTop: 16 }}>
          <h4>注意事项：</h4>
          <p>1. 请使用标准Excel模板进行导入</p>
          <p>2. Excel文件大小不能超过10MB</p>
          <p>3. 表格中的必填字段不能为空</p>
          <p>4. 日期格式请使用YYYY-MM-DD格式</p>
        </div>
      </Modal>

      <Modal
        title="选择杂交品种"
        open={hybridModalOpen}
        onCancel={() => setHybridModalOpen(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setHybridModalOpen(false)}>
            关闭
          </Button>,
          <Button 
            key="export" 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={handleExportHybridization}
          >
            导出配组表
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <h3>当前品种：{currentVariety?.varietyName}</h3>
          <Table
            columns={[
              {
                title: '品种名称',
                dataIndex: 'varietyName',
              },
              {
                title: '留种编号',
                dataIndex: 'seedNumber',
              },
              {
                title: '操作',
                render: (_, record) => (
                  <Button
                    type="primary"
                    onClick={() => handleCreateHybridization(record)}
                  >
                    选择作为配组
                  </Button>
                ),
              },
            ]}
            dataSource={mockData.filter(item => 
              item.key !== currentVariety?.key && 
              item.type === currentVariety?.type &&
              (!item.parentMale || !item.parentFemale)
            )}
            rowKey="key"
          />
          <h3>杂交配组表</h3>
          <Table
            columns={[
              {
                title: '编号',
                dataIndex: 'id',
              },
              {
                title: '母本编号',
                dataIndex: 'femaleNumber',
              },
              {
                title: '父本编号',
                dataIndex: 'maleNumber',
              },
              {
                title: '母本名称',
                dataIndex: 'femaleName',
              },
              {
                title: '父本名称',
                dataIndex: 'maleName',
              },
            ]}
            dataSource={hybridizationList}
            rowKey="id"
          />
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default TableList;
