import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Typography, Space, Divider } from 'antd';
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

const { Title, Paragraph } = Typography;

const Welcome: React.FC = () => {
  // 品种类型数据
  const varietyData = [
    { name: '西瓜', value: 35 },
    { name: '甜瓜', value: 25 },
    { name: '南瓜', value: 20 },
    { name: '黄瓜', value: 20 },
  ];

  // 年度引种数据
  const introductionData = [
    { year: '2020', count: 15, success: 12, rate: 80 },
    { year: '2021', count: 22, success: 19, rate: 86 },
    { year: '2022', count: 28, success: 25, rate: 89 },
    { year: '2023', count: 35, success: 32, rate: 91 },
  ];

  // 品种性能评估数据
  const performanceData = [
    { subject: '抗病性', A: 85, B: 75, fullMark: 100 },
    { subject: '产量', A: 92, B: 85, fullMark: 100 },
    { subject: '口感', A: 88, B: 90, fullMark: 100 },
    { subject: '储存性', A: 82, B: 78, fullMark: 100 },
    { subject: '适应性', A: 87, B: 80, fullMark: 100 },
    { subject: '市场价值', A: 90, B: 85, fullMark: 100 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <PageContainer>
      <Card>
        <Typography>
          <Title level={2} style={{ textAlign: 'center', color: '#1890ff' }}>欢迎使用育种平台</Title>
          <Paragraph style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
            本平台致力于为农业科研工作者提供全面的育种管理解决方案，帮助提高育种效率，实现科学化管理。
          </Paragraph>
        </Typography>
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card hoverable>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#1890ff' }}>品种总数</span>}
              value={156} 
              suffix="个"
              valueStyle={{ color: '#0088FE', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#1890ff' }}>本年度新增</span>}
              value={35} 
              suffix="个"
              valueStyle={{ color: '#00C49F', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#1890ff' }}>留种数量</span>}
              value={89} 
              suffix="份"
              valueStyle={{ color: '#FFBB28', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#1890ff' }}>成功率</span>}
              value={92.8} 
              suffix="%"
              precision={1}
              valueStyle={{ color: '#FF8042', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card 
            title={<span style={{ color: '#1890ff', fontWeight: 'bold' }}>品种类型分布</span>}
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            title={<span style={{ color: '#1890ff', fontWeight: 'bold' }}>年度引种趋势</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={introductionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="引种数量" fill="#82ca9d" />
                  <Bar dataKey="success" name="成功数量" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card 
            title={<span style={{ color: '#1890ff', fontWeight: 'bold' }}>成功率趋势</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={introductionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    name="成功率" 
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title={<span style={{ color: '#1890ff', fontWeight: 'bold' }}>品种性能评估</span>}
            hoverable
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="优质品种"
                    dataKey="A"
                    stroke="#FF8042"
                    fill="#FF8042"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="普通品种"
                    dataKey="B"
                    stroke="#82ca9d"
                    fill="#82ca9d"
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

      <Card style={{ marginTop: 16 }} hoverable>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ color: '#1890ff' }}>平台特色</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Card hoverable>
                  <Title level={4} style={{ color: '#0088FE' }}>数据管理</Title>
                  <Paragraph style={{ fontSize: '14px' }}>
                    提供完整的品种数据管理功能，包括品种信息录入、查询、统计分析等，助力科学决策。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={8}>
                <Card hoverable>
                  <Title level={4} style={{ color: '#00C49F' }}>留种管理</Title>
                  <Paragraph style={{ fontSize: '14px' }}>
                    系统化管理留种信息，追踪种子保存状态，确保种质资源的有效保存和利用。
                  </Paragraph>
                </Card>
              </Col>
              <Col span={8}>
                <Card hoverable>
                  <Title level={4} style={{ color: '#FFBB28' }}>数据分析</Title>
                  <Paragraph style={{ fontSize: '14px' }}>
                    提供多维度的数据分析功能，帮助研究人员更好地了解品种特性和发展趋势。
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>

          <div>
            <Title level={3} style={{ color: '#1890ff' }}>使用指南</Title>
            <Paragraph style={{ fontSize: '14px', lineHeight: '2' }}>
              1. 品种管理：点击&quot;品种管理&quot;菜单，可以查看和管理所有品种信息。
              <br />
              2. 留种记录：在品种列表中点击&quot;留种&quot;按钮，可以将品种添加到留种记录中。
              <br />
              3. 数据导入：支持Excel批量导入功能，提高数据录入效率。
              <br />
              4. 数据分析：系统自动生成各类统计图表，帮助分析品种分布和发展趋势。
            </Paragraph>
          </div>

          <Divider style={{ borderColor: '#1890ff' }} />

          <div>
            <Title level={3} style={{ color: '#1890ff' }}>联系我们</Title>
            <Paragraph style={{ fontSize: '14px', lineHeight: '2' }}>
              如果您在使用过程中遇到任何问题，请联系系统管理员：
              <br />
              电话：15057486855
              <br />
              邮箱：2104170424@qq.com
            </Paragraph>
          </div>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
