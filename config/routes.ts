/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/welcome',
    name: '欢迎',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin',
        redirect: '/admin/sub-page',
      },
      {
        path: '/admin/sub-page',
        name: '二级管理页',
        component: './Admin',
      },
    ],
  },
  {
    name: '种质资源管理',
    icon: 'database',
    path: '/germplasm',
    routes: [
      {
        name: '种质资源库',
        icon: 'experiment',
        path: '/germplasm/list',
        component: './TableList',
      },
      {
        name: '留种记录',
        icon: 'seedling',
        path: '/germplasm/saved-seeds',
        component: './SavedSeeds',
      },
      {
        name: '播种计划表',
        icon: 'fileSearch',
        path: '/germplasm/sowing-records',
        component: './SowingRecords',
      },
    ],
  },
  {
    name: '引种管理',
    icon: 'table',
    path: '/introduction',
    routes: [
      {
        name: '引种记录',
        icon: 'import',
        path: '/introduction/list',
        component: './Introduction',
      },
      {
        name: '播种记录',
        icon: 'seedling',
        path: '/introduction/sowing',
        component: './Introduction/Sowing',
      },
      {
        name: '考种记录',
        icon: 'fileSearch',
        path: '/introduction/test',
        component: './Introduction/Test',
      },
    ],
  },
  {
    name: '自交系纯化管理',
    icon: 'experiment',
    path: '/purification',
    routes: [
      {
        name: '自交系纯化',
        path: '/purification/list',
        component: './Purification',
      },
      {
        name: '播种计划',
        path: '/purification/sowing',
        component: './Purification/Sowing',
      },
      {
        name: '考种记载表',
        path: '/purification/test-records',
        component: './Purification/TestRecords',
      },
      {
        name: '留种记录',
        path: '/purification/saved-seeds',
        component: './Purification/SavedRecords',
      },
    ],
  },
  {
    name: 'AI助手',
    icon: 'robot',
    path: '/AI',
    routes: [
      {
        name: 'AI问答',
        icon: 'robot',
        path: '/AI/ai-chat',
        component: './AI/AIChat',
      },
      {
        name: '问答记录',
        icon: 'HistoryOutlined',
        path: '/AI/chat-history',
        component: './AI/ChatHistory',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
