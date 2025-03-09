import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { useRef } from 'react';
import { ExportOutlined } from '@ant-design/icons';

const SowingRecords: React.FC = () => {
  const actionRef = useRef<ActionType>();

  // 从localStorage获取播种记录
  const getSowingRecords = () => {
    const records = localStorage.getItem('sowingRecords');
    return records ? JSON.parse(records) : [];
  };

  const handleExport = () => {
    const records = getSowingRecords();
    if (records.length === 0) {
      message.warning('暂无播种记录');
      return;
    }

    // 创建CSV内容
    const headers = ['种植编号', '编号', '品种名称', '播种数（自主编制）', '计划', '备注'];
    const csvContent = [
      headers.join(','),
      ...records.map((item: any) => 
        [item.code, item.seedNumber, item.varietyName, item.sowingCount, item.planNumber, item.note].join(',')
      )
    ].join('\n');

    // 创建并下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '考种记载表.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ProColumns[] = [
    {
      title: '种植编号',
      dataIndex: 'code',
      valueType: 'text',
    },
    {
      title: '编号',
      dataIndex: 'seedNumber',
      valueType: 'text',
    },
    {
      title: '品种名称',
      dataIndex: 'varietyName',
      valueType: 'text',
    },
    {
      title: '播种数',
      dataIndex: 'sowingCount',
      valueType: 'digit',
    },
    {
      title: '计划',
      dataIndex: 'planNumber',
      valueType: 'text',
    },
    {
      title: '备注',
      dataIndex: 'note',
      valueType: 'text',
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="播种记录"
        actionRef={actionRef}
        rowKey="code"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="export"
            onClick={handleExport}
            icon={<ExportOutlined />}
          >
            导出考种记载表
          </Button>,
        ]}
        request={async () => ({
          data: getSowingRecords(),
          success: true,
        })}
        columns={columns}
      />
    </PageContainer>
  );
};

export default SowingRecords; 