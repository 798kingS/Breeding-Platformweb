import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef } from 'react';
import type { API } from '@/services/ant-design-pro/typings';

const SavedSeeds: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 80,
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
    },
    {
      title: '留种编号',
      dataIndex: 'seedNumber',
      valueType: 'text',
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueType: 'text',
    },
    {
      title: '种植年份',
      dataIndex: 'plantingYear',
      valueType: 'dateYear',
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem>
        headerTitle="留种记录"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          // 这里应该调用获取留种记录的API
          // 暂时返回空数据
          return {
            data: [],
            success: true,
            total: 0,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default SavedSeeds; 