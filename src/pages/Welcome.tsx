import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import React, { useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { PlayCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';

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

  // 修改：产量与环境关系数据
  const yieldEnvironmentData = [
    { temperature: 20, humidity: 65, yield: 65, name: '20°C' },
    { temperature: 28, humidity: 75, yield: 75, name: '28°C' },
    { temperature: 25, humidity: 70, yield: 70, name: '25°C' },
    { temperature: 15, humidity: 60, yield: 60, name: '15°C' },
  ];

  // 添加：产量与温度关系图表配置
  const yieldTempChartOption: EChartsOption = {
    title: {
      text: '产量与环境关系分析',
      textStyle: {
        color: '#2E7D32',
        fontSize: '16px',
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: yieldEnvironmentData.map(item => item.name),
      name: '产量温度(°C)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '湿度(%)',
      min: 0,
      max: 80,
      interval: 20,
      axisLabel: {
        formatter: '{value}%',
        color: '#666'
      }
    },
    series: [{
      data: yieldEnvironmentData.map(item => item.yield),
      type: 'scatter',
      symbolSize: 20,
      itemStyle: {
        color: '#2E7D32'
      }
    }]
  };

  // 修改：地域品种统计数据
  interface VarietyItem {
    name: string;
    count: number;
  }

  interface RegionVariety {
    name: string;
    varieties: VarietyItem[];
  }

  interface DetailedType {
    name: string;
    subtypes: VarietyItem[];
  }

  interface SweetnessItem {
    range: string;
    count: number;
    percentage: number;
  }

  const regionVarietyData: RegionVariety[] = [
    { name: '吴兴区', varieties: [
      { name: '西瓜', count: 25 },
      { name: '甜瓜', count: 18 },
      { name: '南瓜', count: 12 }
    ]},
    { name: '南浔区', varieties: [
      { name: '西瓜', count: 20 },
      { name: '甜瓜', count: 15 },
      { name: '南瓜', count: 10 }
    ]},
    { name: '德清县', varieties: [
      { name: '西瓜', count: 22 },
      { name: '甜瓜', count: 16 },
      { name: '南瓜', count: 14 }
    ]},
    { name: '长兴县', varieties: [
      { name: '西瓜', count: 28 },
      { name: '甜瓜', count: 20 },
      { name: '南瓜', count: 15 }
    ]},
    { name: '安吉县', varieties: [
      { name: '西瓜', count: 24 },
      { name: '甜瓜', count: 17 },
      { name: '南瓜', count: 13 }
    ]}
  ];

  const detailedTypeData: DetailedType[] = [
    { 
      name: '西瓜',
      subtypes: [
        { name: '大型西瓜', count: 25 },
        { name: '中型西瓜', count: 20 },
        { name: '小型西瓜', count: 15 },
        { name: '无籽西瓜', count: 18 }
      ]
    },
    { 
      name: '甜瓜',
      subtypes: [
        { name: '哈密瓜', count: 22 },
        { name: '网纹瓜', count: 18 },
        { name: '香瓜', count: 15 }
      ]
    },
    { 
      name: '南瓜',
      subtypes: [
        { name: '白皮南瓜', count: 12 },
        { name: '金瓜栗', count: 15 },
        { name: '蜜本南瓜', count: 10 }
      ]
    }
  ];

  const sweetnessData: SweetnessItem[] = [
    { range: '<10°Brix', count: 20, percentage: 15 },
    { range: '10-12°Brix', count: 50, percentage: 38 },
    { range: '12-14°Brix', count: 40, percentage: 30 },
    { range: '>14°Brix', count: 22, percentage: 17 }
  ];

  // 更新主题配色
  const THEME_COLORS = {
    pieChart: [
      '#2E7D32', // 深绿
      '#43A047', // 中深绿
      '#66BB6A', // 中绿
      '#81C784', // 浅绿
      '#A5D6A7'  // 更浅绿
    ],
    gradients: [
      'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)',
      'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
      'linear-gradient(135deg, #66BB6A 0%, #81C784 100%)',
      'linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)',
      'linear-gradient(135deg, #A5D6A7 0%, #C8E6C9 100%)'
    ]
  };

  const CHART_COLORS = {
    primary: '#2E7D32',
    secondary: '#43A047',
    accent: '#66BB6A',
    light: '#E8F5E9',
    tertiary: '#81C784',
    gradient: {
      primary: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)',
      secondary: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)'
    }
  };

  // 更新卡片样式
  const cardStyle = {
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: 'none',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
    }
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px',
    color: '#fff',
    textAlign: 'center' as const,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  };

  // 更新统计卡片样式
  const statisticCardStyle = {
    ...cardStyle,
    background: '#FFFFFF',
    padding: '24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(46, 125, 50, 0.15)'
    }
  };

  // 更新图表卡片样式
  const chartCardStyle = {
    ...cardStyle,
    padding: '24px',
    background: '#FFFFFF',
    '.ant-card-head': {
      borderBottom: 'none',
      padding: '0 0 16px 0'
    },
    '.ant-card-head-title': {
      fontSize: '18px',
      fontWeight: '600'
    }
  };

  // 修改地图数据加载
  useEffect(() => {
    // 加载湖州市及其区县地图数据
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/330500_full.json')
      .then(response => response.json())
      .then(geoJson => {
        // 处理地理数据以适应显示需求
        const features = geoJson.features.map((feature: any) => {
          // 简化区县名称，去掉"市辖区"等后缀
          const name = feature.properties.name;
          feature.properties.name = name
            .replace('市辖区', '')
            .replace('区', '')
            .replace('县', '');
          return feature;
        });
        
        // 更新处理后的地理数据
        const processedGeoJson = {
          ...geoJson,
          features
        };

        // 注册地图数据
        echarts.registerMap('huzhou', processedGeoJson);
      })
      .catch(error => {
        console.error('加载地图数据失败:', error);
        message.error('地图数据加载失败，请刷新页面重试');
      });
  }, []);

  // 修改地图配置
  const mapOption: EChartsOption = {
    title: {
      text: '湖州市各区种子分布',
      left: 'center',
      textStyle: {
        color: '#2E7D32',
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = regionVarietyData.find(item => item.name === params.name);
        if (data) {
          const varietiesHtml = data.varieties
            .map(v => `${v.name}: ${v.count}个`)
            .join('<br/>');
          return `
            <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
            <div style="margin-bottom: 5px;">品种详情：</div>
            ${varietiesHtml}
            <div style="margin-top: 5px;">总数：${data.varieties.reduce((sum, v) => sum + v.count, 0)}个</div>
          `;
        }
        return `${params.name}`;
      }
    },
    visualMap: {
      min: 0,
      max: 70,
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
        map: 'huzhou',
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          color: '#333',
          fontSize: 14
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1.5,
          areaColor: '#E8F5E9'
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff'
          },
          itemStyle: {
            areaColor: '#43A047'
          }
        },
        data: regionVarietyData.map(item => ({
          name: item.name.replace('区', '').replace('县', ''),
          value: item.varieties.reduce((sum, v) => sum + v.count, 0)
        }))
      }
    ]
  };

  return (
    <PageContainer>
      <Card style={{ marginBottom: '32px', ...cardStyle, background: 'transparent', boxShadow: 'none' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              paddingTop: '56.25%',
              background: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
            }}>
              <video
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                controls
                poster="/video-poster.jpg"
                src="https://breed-1258140596.cos.ap-shanghai.myqcloud.com/video/xc.mp4"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ 
              padding: '32px', 
              height: '100%',
              background: 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <Title level={3} style={{ 
                color: '#1B5E20', 
                marginBottom: '24px',
                fontSize: '28px',
                fontWeight: '600'
              }}>
                农科院介绍
              </Title>
              <Paragraph style={{ 
                fontSize: '16px', 
                lineHeight: '1.8',
                color: '#2E7D32'
              }}>
                本视频展示了农科院工作人员的日常，包括：
              </Paragraph>
              <ul style={{ 
                fontSize: '16px', 
                lineHeight: '2',
                color: '#2E7D32',
                marginBottom: '32px'
              }}>
                <li>丰富的种质资源收集与保存</li>
                <li>智能化的种质资源管理系统</li>
                <li>专业的育种数据分析工具</li>
                <li>便捷的种质资源查询与共享</li>
              </ul>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                size="large"
                style={{ 
                  background: THEME_COLORS.gradients[0],
                  border: 'none',
                  height: '48px',
                  borderRadius: '24px',
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)'
                }}
              >
                了解更多
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={{ ...cardStyle, marginBottom: '32px' }}>
        <div style={headerStyle}>
          <Title level={2} style={{ 
            color: '#fff', 
            margin: 0,
            fontSize: '36px',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            种质资源库数据可视化
          </Title>
          <Paragraph style={{ 
            color: '#fff', 
            margin: '16px 0 0',
            fontSize: '18px',
            opacity: 0.9
          }}>
            全面展示种质资源分布与统计信息
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={6}>
            <Card style={statisticCardStyle} hoverable bodyStyle={{ padding: 0 }}>
              <Statistic 
                title={<span style={{ fontSize: '18px', color: '#1B5E20', fontWeight: '500' }}>品种总数</span>}
                value={156} 
                suffix="个"
                valueStyle={{ 
                  color: '#2E7D32', 
                  fontWeight: '600', 
                  fontSize: '36px',
                  background: THEME_COLORS.gradients[0],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={statisticCardStyle} hoverable bodyStyle={{ padding: 0 }}>
              <Statistic 
                title={<span style={{ fontSize: '18px', color: '#1B5E20', fontWeight: '500' }}>本年度新增</span>}
                value={35} 
                suffix="个"
                valueStyle={{ 
                  color: '#43A047', 
                  fontWeight: '600', 
                  fontSize: '36px',
                  background: THEME_COLORS.gradients[1],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={statisticCardStyle} hoverable bodyStyle={{ padding: 0 }}>
              <Statistic 
                title={<span style={{ fontSize: '18px', color: '#1B5E20', fontWeight: '500' }}>留种数量</span>}
                value={89} 
                suffix="份"
                valueStyle={{ 
                  color: '#66BB6A', 
                  fontWeight: '600', 
                  fontSize: '36px',
                  background: THEME_COLORS.gradients[2],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={statisticCardStyle} hoverable bodyStyle={{ padding: 0 }}>
              <Statistic 
                title={<span style={{ fontSize: '18px', color: '#1B5E20', fontWeight: '500' }}>成功率</span>}
                value={92.8} 
                suffix="%"
                precision={1}
                valueStyle={{ 
                  color: '#81C784', 
                  fontWeight: '600', 
                  fontSize: '36px',
                  background: THEME_COLORS.gradients[3],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card 
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '20px',
                fontWeight: '600'
              }}>种子地理分布</span>}
              hoverable
            >
              <div style={{ height: 500, padding: '20px 0' }}>
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
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>品种类型分布</span>}
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
                        <Cell 
                          key={`cell-${index}`} 
                          fill={THEME_COLORS.pieChart[index % THEME_COLORS.pieChart.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #E8F5E9',
                        borderRadius: '4px'
                      }}
                      itemStyle={{ color: '#1B5E20' }}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right"
                      layout="vertical"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>年度引种趋势</span>}
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
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>成功率趋势</span>}
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
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>品种性能评估</span>}
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
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>生长周期对比</span>}
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
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>产量与环境关系分析</span>}
              hoverable
            >
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReactECharts option={yieldTempChartOption} style={{ height: '100%' }} />
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card 
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>品种类型详细分布</span>}
              hoverable
            >
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={detailedTypeData.flatMap(type => 
                      type.subtypes.map(subtype => ({
                        category: type.name,
                        name: subtype.name,
                        count: subtype.count
                      }))
                    )}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="数量" fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              style={chartCardStyle}
              title={<span style={{ 
                background: THEME_COLORS.gradients[0],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '600'
              }}>糖度分布</span>}
              hoverable
            >
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sweetnessData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                    <XAxis dataKey="range" />
                    <YAxis yAxisId="left" orientation="left" stroke={CHART_COLORS.primary} />
                    <YAxis yAxisId="right" orientation="right" stroke={CHART_COLORS.secondary} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="数量" fill={CHART_COLORS.primary} />
                    <Line yAxisId="right" type="monotone" dataKey="percentage" name="占比(%)" stroke={CHART_COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

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
                1. 品种管理：点击&quot;种质资源库&quot;，可以查看和管理所有品种信息。<br />
                2. 留种记录：在&quot;留种记录&quot;页面，可以记录和追踪种子保存情况。<br />
                3. 考种记载：通过&quot;考种记载表&quot;，可以详细记录种植过程中的各项指标。<br />
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
