import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Input, Button, List, Avatar, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { queryAI } from '@/services/ant-design-pro/api';
import 'github-markdown-css/github-markdown.css';
import styles from './index.less';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface LocationState {
  sessionId?: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const sessionId = (location.state as LocationState)?.sessionId;

  // 自动滚动到底部
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  useEffect(() => {
    // 如果有sessionId，从历史记录中加载对话
    if (sessionId) {
      const history = localStorage.getItem('chatHistory');
      if (history) {
        const sessions = JSON.parse(history);
        const currentSession = sessions.find((s: any) => s.id === sessionId);
        if (currentSession) {
          setMessages(currentSession.messages);
        }
      }
    }
  }, [sessionId]);

  useEffect(() => {
    // scrollToBottom();
  }, [messages]);

  // 保存聊天记录
  const saveChatHistory = (newMessages: ChatMessage[]) => {
    const history = localStorage.getItem('chatHistory');
    let sessions = history ? JSON.parse(history) : [];

    if (sessionId) {
      // 更新现有会话
      sessions = sessions.map((session: any) => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: newMessages,
            lastMessage: newMessages[newMessages.length - 1].content
          };
        }
        return session;
      });
    } else {
      // 创建新会话
      const newSession = {
        id: uuidv4(),
        messages: newMessages,
        createdAt: Date.now(),
        lastMessage: newMessages[newMessages.length - 1].content
      };
      sessions.unshift(newSession); // 添加到开头
    }

    localStorage.setItem('chatHistory', JSON.stringify(sessions));
  };

  // 处理发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await queryAI(apiMessages);

      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.data,
          timestamp: Date.now(),
        };
        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);
        saveChatHistory(newMessages);
      } else {
        message.error(response.error || '获取AI回复失败');
      }
    } catch (error) {
      message.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理按下回车
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 渲染markdown内容
  const renderMessageContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <PageContainer>
      <div className={styles['chat-container']}>
        <div className={styles['message-list']}>
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(item) => (
              <List.Item className={`${styles['message-item']} ${styles[item.role]}`}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                    width: '100%',
                  }}
                >
                  <Avatar
                    icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    className={`${styles.avatar} ${styles[item.role]}`}
                  />
                  <div className={styles['message-content']} style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {item.role === 'user' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                    ) : (
                      <div className={`${styles['markdown-content']} markdown-body`}>
                        {renderMessageContent(item.content)}
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        <div className={styles['input-area']}>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
          >
            发送
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default AIChat; 