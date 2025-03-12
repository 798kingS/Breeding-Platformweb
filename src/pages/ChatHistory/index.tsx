import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, List, Tag, Typography, Space, Button, Popconfirm, Empty } from 'antd';
import { MessageOutlined, DeleteOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { history } from 'umi';
import styles from './index.less';

const { Text, Paragraph } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastMessage: string;
}

const ChatHistory: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  useEffect(() => {
    // 从localStorage加载聊天历史
    const loadChatHistory = () => {
      const history = localStorage.getItem('chatHistory');
      if (history) {
        setChatHistory(JSON.parse(history));
      }
    };
    loadChatHistory();
  }, []);

  // 删除单个会话
  const handleDeleteSession = (sessionId: string) => {
    const newHistory = chatHistory.filter(session => session.id !== sessionId);
    setChatHistory(newHistory);
    localStorage.setItem('chatHistory', JSON.stringify(newHistory));
  };

  // 清空所有历史记录
  const handleClearAll = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  // 查看会话详情
  const handleViewSession = (sessionId: string) => {
    // 跳转到聊天页面并加载历史会话
    history.push('/ai-chat', { sessionId });
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageContainer>
      <Card
        className={styles.historyCard}
        title={
          <Space>
            <MessageOutlined />
            聊天历史记录
          </Space>
        }
        extra={
          <Popconfirm
            title="确定要清空所有历史记录吗？"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              清空历史
            </Button>
          </Popconfirm>
        }
      >
        {chatHistory.length > 0 ? (
          <List
            className={styles.historyList}
            itemLayout="vertical"
            dataSource={chatHistory}
            renderItem={(session) => (
              <List.Item
                key={session.id}
                actions={[
                  <Button
                    type="link"
                    key="view"
                    onClick={() => handleViewSession(session.id)}
                  >
                    查看详情
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定要删除这条记录吗？"
                    onConfirm={() => handleDeleteSession(session.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
                className={styles.historyItem}
              >
                <List.Item.Meta
                  avatar={<UserOutlined className={styles.userIcon} />}
                  title={
                    <Space>
                      <Text strong>对话记录</Text>
                      <Tag color="blue">{session.messages.length} 条消息</Tag>
                      <Tag icon={<ClockCircleOutlined />} color="default">
                        {formatTime(session.createdAt)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Paragraph ellipsis={{ rows: 2 }} className={styles.lastMessage}>
                      {session.lastMessage}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无聊天记录"
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default ChatHistory; 