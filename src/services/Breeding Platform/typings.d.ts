// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  // type LoginResult = {
  //   status?: string;
  //   type?: string;
  //   currentAuthority?: string;
  // };

  type LoginResult = {
    token?: string;
    id?: number;
    username?: string;
    role?: string;
    status?: 'ok' | 'error';
    type?: string;
    message?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key: number;
    photo1: string;
    photo2: string;
    varietyName: string;
    type: string;
    introductionYear: string;
    source: string;
    breedingType: string;
    seedNumber: string;
    plantingYear: string;
    resistance: string;
    fruitCharacteristics: string;
    floweringPeriod: string;
    fruitCount: number;
    yield: number;
    fruitShape: string;
    skinColor: string;
    fleshColor: string;
    singleFruitWeight: number;
    fleshThickness: number;
    sugarContent: number;
    texture: string;
    overallTaste: string;
    combiningAbility: string;
    hybridization: string;
    // parentMale?: string;
    // parentFemale?: string;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ImageContent = {
    image?: string;
    text?: string;
    content?: string;
  }

  type LoginState = {
    status?: 'ok' | 'error';
    type?: string;
    message?: string;
    token?: string;
    id?: number;
    username?: string;
    role?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type RegisterParams = {
    username: string;
    password: string;
  };

  type RegisterResult = {
    success: boolean;
    message: string;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
