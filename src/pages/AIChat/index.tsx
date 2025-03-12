import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Input, Button, Card, List, Avatar, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { queryAI } from '@/services/ant-design-pro/api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'github-markdown-css/github-markdown.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 准备发送给API的消息历史
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 调用Deepseek API
      const response = await queryAI(apiMessages);

      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.data,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMessage]);
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
      <Card
        bordered={false}
        style={{
          height: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(item) => (
              <List.Item
                style={{
                  justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                  border: 'none',
                  padding: '8px 0',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a',
                      margin: item.role === 'user' ? '0 0 0 12px' : '0 12px 0 0',
                    }}
                  />
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: item.role === 'user' ? '#1890ff' : '#fff',
                      color: item.role === 'user' ? '#fff' : '#000',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      width: '100%',
                    }}
                  >
                    {item.role === 'user' ? (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                    ) : (
                      <div className="markdown-body" style={{ background: 'none' }}>
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

        <div style={{ display: 'flex', gap: '8px' }}>
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
            style={{ height: 'auto' }}
          >
            发送
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
};

export default AIChat; 