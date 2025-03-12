import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Typography, Space, Divider } from 'antd';
import React, { useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, ScatterChart,
  Scatter, ZAxis
} from 'recharts';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const { Title, Paragraph } = Typography;

const Welcome: React.FC = () => {
  // 品种类型数据 - 更详细的数据
  const varietyData = [
    { name: '西瓜', value: 35, subTypes: '8号西瓜,甜王,黑美人' },
    { name: '甜瓜', value: 25, subTypes: '哈密瓜,网纹瓜,白兰瓜' },
    { name: '南瓜', value: 20, subTypes: '金瓜栗,蜜本南瓜,白皮南瓜' },
    { name: '黄瓜', value: 20, subTypes: '旱黄瓜,水黄瓜,荷兰黄瓜' },
    { name: '其他瓜类', value: 10, subTypes: '苦瓜,丝瓜,冬瓜' },
  ];

  // 年度引种数据 - 更详细的月度数据
  const introductionData = [
    { year: '2020', count: 15, success: 12, rate: 80, spring: 5, summer: 4, autumn: 3, winter: 3 },
    { year: '2021', count: 22, success: 19, rate: 86, spring: 7, summer: 6, autumn: 5, winter: 4 },
    { year: '2022', count: 28, success: 25, rate: 89, spring: 8, summer: 8, autumn: 7, winter: 5 },
    { year: '2023', count: 35, success: 32, rate: 91, spring: 10, summer: 9, autumn: 8, winter: 8 },
  ];

  // 品种性能评估数据 - 更详细的评分
  const performanceData = [
    { subject: '抗病性', A: 85, B: 75, C: 65, fullMark: 100 },
    { subject: '产量', A: 92, B: 85, C: 70, fullMark: 100 },
    { subject: '口感', A: 88, B: 90, C: 75, fullMark: 100 },
    { subject: '储存性', A: 82, B: 78, C: 68, fullMark: 100 },
    { subject: '适应性', A: 87, B: 80, C: 72, fullMark: 100 },
    { subject: '市场价值', A: 90, B: 85, C: 78, fullMark: 100 },
  ];

  // 新增：生长周期数据
  const growthCycleData = [
    { name: '发芽期', 西瓜: 7, 甜瓜: 5, 南瓜: 6, 黄瓜: 4 },
    { name: '幼苗期', 西瓜: 15, 甜瓜: 12, 南瓜: 14, 黄瓜: 10 },
    { name: '生长期', 西瓜: 30, 甜瓜: 25, 南瓜: 28, 黄瓜: 20 },
    { name: '开花期', 西瓜: 10, 甜瓜: 8, 南瓜: 9, 黄瓜: 7 },
    { name: '结果期', 西瓜: 40, 甜瓜: 35, 南瓜: 38, 黄瓜: 30 },
  ];

  // 新增：产量与环境关系数据
  const yieldEnvironmentData = [
    { temperature: 20, humidity: 65, yield: 80, name: '春季' },
    { temperature: 28, humidity: 75, yield: 95, name: '夏季' },
    { temperature: 25, humidity: 70, yield: 90, name: '秋季' },
    { temperature: 15, humidity: 60, yield: 70, name: '冬季' },
  ];

  // 新增：种子分布数据
  const seedDistributionData = [
    { 
      name: '北京', 
      value: 25, 
      types: '西瓜,甜瓜',
      details: {
        '西瓜': 15,
        '甜瓜': 10
      }
    },
    { 
      name: '山东', 
      value: 45, 
      types: '西瓜,甜瓜,南瓜',
      details: {
        '西瓜': 20,
        '甜瓜': 15,
        '南瓜': 10
      }
    },
    { 
      name: '河南', 
      value: 35, 
      types: '西瓜,黄瓜',
      details: {
        '西瓜': 20,
        '黄瓜': 15
      }
    },
    { 
      name: '新疆', 
      value: 55, 
      types: '甜瓜,西瓜',
      details: {
        '甜瓜': 35,
        '西瓜': 20
      }
    },
    { 
      name: '海南', 
      value: 30, 
      types: '西瓜,南瓜',
      details: {
        '西瓜': 18,
        '南瓜': 12
      }
    },
    { 
      name: '云南', 
      value: 40, 
      types: '南瓜,黄瓜',
      details: {
        '南瓜': 25,
        '黄瓜': 15
      }
    },
    { 
      name: '广东', 
      value: 35, 
      types: '西瓜,黄瓜',
      details: {
        '西瓜': 20,
        '黄瓜': 15
      }
    },
    { 
      name: '江苏', 
      value: 42, 
      types: '西瓜,南瓜,黄瓜',
      details: {
        '西瓜': 15,
        '南瓜': 12,
        '黄瓜': 15
      }
    },
    { 
      name: '四川', 
      value: 38, 
      types: '南瓜,黄瓜',
      details: {
        '南瓜': 20,
        '黄瓜': 18
      }
    },
    { 
      name: '湖北', 
      value: 33, 
      types: '西瓜,甜瓜',
      details: {
        '西瓜': 18,
        '甜瓜': 15
      }
    }
  ];

  // 育种主题配色
  const THEME_COLORS = ['#2E7D32', '#4CAF50', '#81C784', '#C8E6C9', '#A5D6A7'];
  const CHART_COLORS = {
    primary: '#2E7D32',
    secondary: '#4CAF50',
    accent: '#81C784',
    light: '#E8F5E9',
    tertiary: '#A5D6A7',
  };

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E8F5E9',
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    color: '#fff',
    textAlign: 'center' as const,
  };

  // 地图配置
  const mapOption: EChartsOption = {
    title: {
      text: '种子地理分布',
      left: 'center',
      textStyle: {
        color: '#2E7D32'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = seedDistributionData.find(item => item.name === params.name);
        if (data) {
          const detailsHtml = Object.entries(data.details)
            .map(([type, count]) => `${type}: ${count}个`)
            .join('<br/>');
          return `
            <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
            <div style="margin-bottom: 5px;">总数量：${data.value}个</div>
            <div style="font-weight: bold; margin-bottom: 3px;">各类型数量：</div>
            ${detailsHtml}
          `;
        }
        return `${params.name}`;
      }
    },
    visualMap: {
      min: 0,
      max: 60,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      inRange: {
        color: ['#E8F5E9', '#81C784', '#2E7D32']
      },
      calculable: true
    },
    series: [
      {
        name: '种子分布',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#4CAF50'
          }
        },
        data: seedDistributionData,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          show: true,
          color: '#333'
        }
      }
    ]
  };

  // 加载中国地图数据
  useEffect(() => {
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(response => response.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson);
      });
  }, []);

  return (
    <PageContainer>
      <div style={headerStyle}>
        <Title level={2} style={{ color: '#fff', margin: 0, marginBottom: '16px' }}>
          欢迎使用Breeding Platform
        </Title>
        <Paragraph style={{ color: '#fff', fontSize: '16px', margin: 0, opacity: 0.9 }}>
          致力于为农业科研工作者提供专业的育种管理解决方案，助力中国农业发展
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card style={cardStyle} hoverable bodyStyle={{ padding: '24px' }}>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#2E7D32' }}>品种总数</span>}
              value={156} 
              suffix="个"
              valueStyle={{ color: '#2E7D32', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle} hoverable bodyStyle={{ padding: '24px' }}>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#2E7D32' }}>本年度新增</span>}
              value={35} 
              suffix="个"
              valueStyle={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle} hoverable bodyStyle={{ padding: '24px' }}>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#2E7D32' }}>留种数量</span>}
              value={89} 
              suffix="份"
              valueStyle={{ color: '#81C784', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle} hoverable bodyStyle={{ padding: '24px' }}>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#2E7D32' }}>成功率</span>}
              value={92.8} 
              suffix="%"
              precision={1}
              valueStyle={{ color: '#2E7D32', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            style={cardStyle}
            title={<span style={{ color: '#2E7D32', fontWeight: 'bold' }}>种子地理分布</span>}
            hoverable
          >
            <div style={{ height: 500 }}>
              <ReactECharts 
                option={mapOption}
                style={{ height: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card 
            style={cardStyle}
            title={<span style={{ color: '#2E7D32', fontWeight: 'bold' }}>品种类型分布</span>}
            hoverable
          >
            <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={varietyData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {varietyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            style={cardStyle}
            title={<span style={{ color: '#2E7D32', fontWeight: 'bold' }}>年度引种趋势</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={introductionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="引种数量" fill={CHART_COLORS.primary} />
                  <Bar dataKey="success" name="成功数量" fill={CHART_COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card 
            style={cardStyle}
            title={<span style={{ color: '#2E7D32', fontWeight: 'bold' }}>成功率趋势</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={introductionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    name="成功率" 
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ r: 6, fill: CHART_COLORS.primary }}
                    activeDot={{ r: 8, fill: CHART_COLORS.accent }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            style={cardStyle}
            title={<span style={{ color: '#2E7D32', fontWeight: 'bold' }}>品种性能评估</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={performanceData}>
                  <PolarGrid stroke="#E8F5E9" />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="优质品种"
                    dataKey="A"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="普通品种"
                    dataKey="B"
                    stroke={CHART_COLORS.secondary}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card 
            style={cardStyle}
            title={<span style={{ color: '#2E7D32', fontWeight: 'bold' }}>生长周期对比</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growthCycleData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: '天数', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="西瓜" stackId="1" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="甜瓜" stackId="1" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="南瓜" stackId="1" stroke={CHART_COLORS.accent} fill={CHART_COLORS.accent} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="黄瓜" stackId="1" stroke={CHART_COLORS.tertiary} fill={CHART_COLORS.tertiary} fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            style={cardStyle}
            title={<span style={{ color: '#2E7D32', fontWeight: 'bold' }}>产量与环境关系分析</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis 
                    dataKey="temperature" 
                    name="温度" 
                    unit="°C"
                    label={{ value: '温度(°C)', position: 'bottom' }}
                  />
                  <YAxis 
                    dataKey="humidity" 
                    name="湿度" 
                    unit="%"
                    label={{ value: '湿度(%)', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis 
                    dataKey="yield" 
                    name="产量" 
                    unit="%" 
                    range={[50, 400]}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter 
                    name="产量分布" 
                    data={yieldEnvironmentData} 
                    fill={CHART_COLORS.primary}
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ ...cardStyle, marginTop: 16 }} hoverable>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ color: '#2E7D32', marginBottom: '24px' }}>平台特色</Title>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card 
                  style={{ ...cardStyle, background: '#F9FBE7' }} 
                  hoverable
                  bodyStyle={{ height: '200px' }}
                >
                  <Title level={4} style={{ color: '#2E7D32' }}>智能数据管理</Title>
                  <Paragraph style={{ fontSize: '14px', color: '#1B5E20' }}>
                    采用先进的数据管理系统，实现品种信息的智能化管理。提供完整的数据录入、查询和分析功能，
                    支持多维度的统计分析，助力科研人员做出更准确的决策。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={8}>
                <Card 
                  style={{ ...cardStyle, background: '#F1F8E9' }} 
                  hoverable
                  bodyStyle={{ height: '200px' }}
                >
                  <Title level={4} style={{ color: '#2E7D32' }}>全程留种追踪</Title>
                  <Paragraph style={{ fontSize: '14px', color: '#1B5E20' }}>
                    提供完整的留种管理流程，包括种子保存、质量监控、发芽率追踪等功能。
                    实时监控种质资源状态，确保种子的安全存储和有效利用。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={8}>
                <Card 
                  style={{ ...cardStyle, background: '#E8F5E9' }} 
                  hoverable
                  bodyStyle={{ height: '200px' }}
                >
                  <Title level={4} style={{ color: '#2E7D32' }}>育种分析预测</Title>
                  <Paragraph style={{ fontSize: '14px', color: '#1B5E20' }}>
                    运用大数据分析技术，对品种特性进行多维度分析。提供育种趋势预测、
                    性状关联分析等功能，为育种工作提供科学依据。
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>

          <div style={{ marginTop: '24px' }}>
            <Title level={3} style={{ color: '#2E7D32', marginBottom: '16px' }}>使用指南</Title>
            <Card style={{ background: '#F1F8E9', border: 'none' }}>
              <Paragraph style={{ fontSize: '14px', lineHeight: '2', color: '#1B5E20' }}>
                1. 品种管理：点击"种质资源库"，可以查看和管理所有品种信息。<br />
                2. 留种记录：在"留种记录"页面，可以记录和追踪种子保存情况。<br />
                3. 考种记载：通过"考种记载表"，可以详细记录种植过程中的各项指标。<br />
                4. 数据分析：系统提供多维度的数据分析工具，帮助您更好地了解品种特性。<br />
                5. 报表导出：可以导出各类统计报表，方便数据归档和分析。
              </Paragraph>
            </Card>
          </div>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
