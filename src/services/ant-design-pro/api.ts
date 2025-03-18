// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { generateMockData } from './mockData';

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
          const itemValue = item[realKey as keyof typeof item];
          return typeof itemValue === 'number' ? itemValue >= params[key] : true;
        }
        if (key.includes('Max')) {
          const realKey = key.replace('Max', '');
          const itemValue = item[realKey as keyof typeof item];
          return typeof itemValue === 'number' ? itemValue <= params[key] : true;
        }
        // 处理普通搜索
        const itemValue = item[key as keyof typeof item];
        if (typeof itemValue === 'string') {
          return itemValue.includes(params[key]);
        }
        return itemValue === params[key];
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
// 导出一个异步函数，用于导入Excel文件
export async function importExcel(formData: FormData) {
  // 发送POST请求，请求地址为'/api/seed/Seedimport'，请求方法为POST，请求参数为formData
  return request<{
    data: API.RuleListItem[]; // 返回的数据类型为API.RuleListItem数组
    success: boolean; // 返回的成功状态
    message?: string; // 返回的消息
    headers: {
      'Content-Type': 'multipart/form-data', // 手动设置请求头
    },
  }>('/api/seed/Seedimport', {
    method: 'POST',
    data: formData,
  });
}

// Deepseek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function queryAI(messages: { role: string; content: string }[]) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-16176635cae049b186cd9f0b4ebfe352`,
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices[0].message.content,
    };
  } catch (error) {
    console.error('AI API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
