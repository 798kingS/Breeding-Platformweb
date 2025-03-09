// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

// 模拟数据生成函数
function generateMockData() {
  const varieties = [
    { name: '红宝石西瓜', type: '西瓜' },
    { name: '金玉甜瓜', type: '甜瓜' },
    { name: '蜜汁南瓜', type: '南瓜' },
    { name: '翠玉黄瓜', type: '黄瓜' },
  ];

  const sources = ['农业科学院', '省农科所', '市农科所', '国际种质库', '地方品种改良中心'];
  const resistances = ['抗病毒、耐寒', '抗白粉病', '抗枯萎病', '抗病毒', '耐寒、抗病'];
  const textures = ['脆嫩', '细腻', '绵密', '爽脆', '软糯'];
  const tastes = ['甜度高，口感好', '香甜可口', '清甜爽口', '香甜多汁', '甜度适中'];
  const abilities = ['优良', '良好', '一般', '较好', '待观察'];
  const hybridStatuses = ['已完成第一代杂交', '纯系选育中', '杂交进行中', '品系对比中', '区域试验中'];

  const mockData: API.RuleListItem[] = [];

  for (let i = 0; i < 30; i++) {
    const varietyIndex = i % varieties.length;
    const year = 2020 + Math.floor(i / 6);
    const variety = varieties[varietyIndex];
    
    mockData.push({
      key: i + 1,
      varietyName: `${variety.name}-${Math.floor(i / 4) + 1}号`,
      type: variety.type,
      photo: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      introductionYear: year.toString(),
      source: sources[i % sources.length],
      breedingType: i % 2 === 0 ? 'regular' : 'pure',
      seedNumber: `${variety.type.substring(0, 1)}G${year}${(i + 1).toString().padStart(3, '0')}`,
      plantingYear: (year + 1).toString(),
      resistance: resistances[i % resistances.length],
      fruitCharacteristics: `${i % 2 === 0 ? '圆形' : '椭圆形'}，品质优良`,
      floweringPeriod: `${4 + (i % 3)}-${5 + (i % 3)}月开花`,
      fruitCount: 40 + i * 2,
      yield: 1500 + i * 100,
      fruitShape: i % 2 === 0 ? '圆形' : '椭圆形',
      skinColor: i % 2 === 0 ? '深绿色' : '浅绿色',
      fleshColor: i % 3 === 0 ? '红色' : i % 3 === 1 ? '黄色' : '白色',
      singleFruitWeight: variety.type === '西瓜' ? 4000 + i * 100 : 800 + i * 50,
      fleshThickness: 15 + i % 20,
      sugarContent: 8 + (i % 8),
      texture: textures[i % textures.length],
      overallTaste: tastes[i % tastes.length],
      combiningAbility: abilities[i % abilities.length],
      hybridizationStatus: hybridStatuses[i % hybridStatuses.length],
    });
  }

  return mockData;
}

export const mockData = generateMockData();

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    current?: number;
    pageSize?: number;
    [key: string]: any;
  },
  options?: { [key: string]: any },
) {
  // 处理搜索条件
  let filteredData = [...mockData];

  // 根据搜索参数过滤数据
  Object.keys(params).forEach(key => {
    if (params[key] && key !== 'current' && key !== 'pageSize') {
      filteredData = filteredData.filter(item => {
        // 处理范围搜索
        if (key.includes('Min')) {
          const realKey = key.replace('Min', '');
          return item[realKey] >= params[key];
        }
        if (key.includes('Max')) {
          const realKey = key.replace('Max', '');
          return item[realKey] <= params[key];
        }
        // 处理普通搜索
        if (typeof item[key] === 'string') {
          return item[key].includes(params[key]);
        }
        return item[key] === params[key];
      });
    }
  });

  // 计算分页
  const pageSize = params.pageSize || 10;
  const current = params.current || 1;
  const start = (current - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: filteredData.slice(start, end),
    total: filteredData.length,
    success: true,
    pageSize,
    current,
  };
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data:{
      method: 'update',
      ...(options || {}),
    }
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data:{
      method: 'post',
      ...(options || {}),
    }
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data:{
      method: 'delete',
      ...(options || {}),
    }
  });
}

/** 保存种子到留种页面 POST /api/save-seed */
export async function saveSeed(body: {
  varietyName: string;
  type: string;
  seedNumber: string;
  photo: string;
  source: string;
  plantingYear: string;
  [key: string]: any;
}, options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/save-seed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 导入Excel POST /api/import-excel */
export async function importExcel(formData: FormData) {
  return request<{
    data: API.RuleListItem[];
    success: boolean;
    message?: string;
  }>('/api/import-excel', {
    method: 'POST',
    data: formData,
  });
}
