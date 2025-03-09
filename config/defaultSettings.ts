import { ProLayoutProps } from '@ant-design/pro-components';



/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  "colorPrimary": "#52C41A",
  "layout": "side",
  "contentWidth": "Fluid",
  "fixedHeader": false,
  "fixSiderbar": true,
  colorWeak: false,
  title: 'Breeding Platform',
  pwa: true,
  logo: 'https://breed-1258140596.cos.ap-shanghai.myqcloud.com/%E7%A7%8D%E8%B4%A8%E8%B5%84%E6%BA%90/logo.png',
  iconfontUrl: '',
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
  "splitMenus": false
};

export default Settings;
