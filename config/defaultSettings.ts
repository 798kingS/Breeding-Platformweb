import { ProLayoutProps } from '@ant-design/pro-components';



/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#2E7D32',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Breeding Platform',
  pwa: true,
  logo: 'https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/logo.png',
  iconfontUrl: '',
  token: {
    // 参考官方文档：https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
    header: {
      colorBgHeader: '#f0f7f0',
      colorHeaderTitle: '#2E7D32',
      colorTextMenu: '#004D40',
      colorTextMenuSecondary: '#2E7D32',
      colorTextMenuSelected: '#00C853',
      colorBgMenuItemSelected: '#E8F5E9',
      colorTextMenuActive: '#00C853',
      colorTextRightActionsItem: '#2E7D32',
    },
    sider: {
      colorMenuBackground: '#FFFFFF',
      colorMenuItemDivider: '#E8F5E9',
      colorTextMenu: '#004D40',
      colorTextMenuSelected: '#00C853',
      colorTextMenuActive: '#00C853',
      colorBgMenuItemSelected: '#E8F5E9',
    },
  },
  "splitMenus": false
};

export default Settings;
