// user/login.tsx
import { Footer } from '@/components';
import { getFakeCaptcha } from '@/services/Breeding Platform/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, history, SelectLang, useIntl, useModel, Helmet } from '@umijs/max';
import { Alert, message, Tabs, Modal, Form, Input, Button } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { createStyles } from 'antd-style';
import { login, register } from '@/services/Breeding Platform/api';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
    registerLink: {
      display: 'block',
      textAlign: 'center',
      marginTop: 16,
      color: token.colorPrimary,
      fontWeight: 500,
      cursor: 'pointer',
      '&:hover': {
        color: token.colorPrimaryHover,
      },
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();

  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};



const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

type LoginState = {
  status?: 'ok' | 'error';
  type?: string;
  message?: string;
  token?: string;
  id?: number;
  username?: string;
  role?: string;
};

const RegisterModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intl = useIntl();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const values = await form.validateFields();
      const response = await register(values);

      if (response.success) {
        message.success(
          intl.formatMessage({
            id: 'pages.register.success',
            defaultMessage: '注册成功！',
          })
        );
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        setError(response.message || '注册失败，请重试');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          intl.formatMessage({
            id: 'pages.register.failure',
            defaultMessage: '注册失败，请重试',
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'menu.register', defaultMessage: '用户注册' })}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          {intl.formatMessage({ id: 'pages.register.cancel', defaultMessage: '取消' })}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {intl.formatMessage({ id: 'pages.register.submit', defaultMessage: '注册' })}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        <Form.Item
          name="username"
          label={intl.formatMessage({ id: 'pages.register.username', defaultMessage: '用户名' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.register.username.required',
                defaultMessage: '请输入用户名!',
              }),
            },
            {
              min: 4,
              message: intl.formatMessage({
                id: 'pages.register.username.min',
                defaultMessage: '用户名至少4个字符!',
              }),
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={intl.formatMessage({
              id: 'pages.register.username.placeholder',
              defaultMessage: '请输入用户名',
            })}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={intl.formatMessage({ id: 'pages.register.password', defaultMessage: '密码' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.register.password.required',
                defaultMessage: '请输入密码!',
              }),
            },
            {
              min: 6,
              message: intl.formatMessage({
                id: 'pages.register.password.min',
                defaultMessage: '密码至少6个字符!',
              }),
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={intl.formatMessage({
              id: 'pages.register.password.placeholder',
              defaultMessage: '请输入密码',
            })}
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={intl.formatMessage({
            id: 'pages.register.confirmPassword',
            defaultMessage: '确认密码',
          })}
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.register.confirmPassword.required',
                defaultMessage: '请确认密码!',
              }),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    intl.formatMessage({
                      id: 'pages.register.confirmPassword.mismatch',
                      defaultMessage: '两次输入的密码不匹配!',
                    })
                  )
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={intl.formatMessage({
              id: 'pages.register.confirmPassword.placeholder',
              defaultMessage: '请再次输入密码',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<LoginState>({});
  const [type, setType] = useState<string>('account');
  const [registerVisible, setRegisterVisible] = useState(false);
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const response = await login({
        ...values,
        type,
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.id?.toString() || '');
        localStorage.setItem('userRole', response.role || '');
      }

      setUserLoginState({
        status: 'ok',
        type,
        token: response.token,
        id: response.id,
        username: response.username,
        role: response.role
      });

      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: {
            name: response.username || values.username || 'User',
            avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
            userid: response.id?.toString() || '00000002',
            email: '2104170424@qq.com',
            signature: '专注种植，用心培育',
            title: '种植专家',
            group: '育种平台－种植部门',
            tags: [
              {
                key: '0',
                label: '种植达人',
              },
            ],
            notifyCount: 5,
            unreadCount: 3,
            country: 'China',
            access: response.role || 'user',
            geographic: {
              province: {
                label: '浙江省',
                key: '330000',
              },
              city: {
                label: '湖州市',
                key: '330500',
              },
            },
            address: '湖州市吴兴区',
            phone: '0572-12345678',
          },
        }));
      });

      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: '登录成功！',
      });
      message.success(defaultLoginSuccessMessage);

      const urlParams = new URL(window.location.href).searchParams;
      history.push(urlParams.get('redirect') || '/');
      return;
    } catch (error: any) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });

      // 显示后端返回的错误信息
      let errorMessage = defaultLoginFailureMessage;

      if (error.name === 'AxiosError') {
        if (error.response?.status === 401) {
          errorMessage = intl.formatMessage({
            id: 'pages.login.unauthorized',
            defaultMessage: '用户名或密码错误',
          });
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);

      // 正确更新错误状态
      setUserLoginState({
        status: 'error',
        type,
        message: errorMessage
      });
    }
  };

  const { status, type: loginType, message: errorMessage } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="https://breed-1258140596.cos.ap-shanghai.myqcloud.com/Breeding%20Platform/logo.png" />}
          title="Breeding Platform"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <ActionIcons key="icons" />,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                }),
              },
              {
                key: 'mobile',
                label: intl.formatMessage({
                  id: 'pages.login.phoneLogin.tab',
                  defaultMessage: '手机号登录',
                }),
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={errorMessage || intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '请输入用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '请输入密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && type === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });
                  if (!result) {
                    return;
                  }
                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
            </a>
          </div>
          <a
            className={styles.registerLink}
            onClick={() => setRegisterVisible(true)}
          >
            <FormattedMessage id="pages.login.register" defaultMessage="注册新账户" />
          </a>
        </LoginForm>
      </div>
      <Footer />
      <RegisterModal
        visible={registerVisible}
        onCancel={() => setRegisterVisible(false)}
        onSuccess={() => {
          message.success(
            intl.formatMessage({
              id: 'pages.register.success',
              defaultMessage: '注册成功！请登录',
            })
          );
        }}
      />
    </div>
  );
};

export default Login;