import React, { useState } from 'react';
import { Upload, Button, Image, Spin, Typography, message, Descriptions } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Tesseract from 'tesseract.js';
import './index.less';

const { Paragraph } = Typography;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// DeepSeek API 封装
export async function queryAI(messages: { role: string; content: string }[]) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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

// 生成 prompt
function buildPrompt(ocrText: string) {
  return [
    {
      role: 'system',
      content: '你是一个农业种子专家，请根据图片识别出的文字内容，判断图片中种子的品种和性状，并用简洁的中文回答。',
    },
    {
      role: 'user',
      content: `图片识别文字如下：\n${ocrText}\n请判断品种和性状。`,
    },
  ];
}

const ImageIdentify: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [deepSeekLoading, setDeepSeekLoading] = useState<boolean>(false);
  const [deepSeekResult, setDeepSeekResult] = useState<{ variety?: string; traits?: string; raw?: string } | null>(null);

  const handleUpload = (info: any) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const fileObj = info.file.originFileObj || info.file;
      const url = URL.createObjectURL(fileObj);
      setImageUrl(url);
      setOcrText('');
      setDeepSeekResult(null);
      setLoading(true);
      setDeepSeekLoading(false);
      Tesseract.recognize(fileObj, 'eng+chi_sim', {
        logger: m => console.log(m),
      })
        .then(({ data: { text } }) => {
          setOcrText(text);
          setDeepSeekLoading(true);
          return queryAI(buildPrompt(text));
        })
        .then((result) => {
          if (result.success) {
            // 简单正则提取品种和性状（可根据实际AI返回格式调整）
            const match = result.data.match(/品种[:：]?([\u4e00-\u9fa5A-Za-z0-9_-]+)[\s,，。；;\n]+性状[:：]?([\u4e00-\u9fa5A-Za-z0-9_，、\s]+)/);
            if (match) {
              setDeepSeekResult({ variety: match[1], traits: match[2], raw: result.data });
            } else {
              setDeepSeekResult({ raw: result.data });
            }
          } else {
            setDeepSeekResult({ raw: result.error });
          }
        })
        .catch(() => {
          message.error('文字识别失败');
        })
        .finally(() => {
          setLoading(false);
          setDeepSeekLoading(false);
        });
    }
  };

  return (
    <div className="image-identify-container">
      <div className="image-identify-left">
        <div className="image-identify-title">图片品种识别</div>
        <div className="image-identify-upload">
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={({ onSuccess }) => {
              setTimeout(() => {
                if (onSuccess) onSuccess('ok');
              }, 0);
            }}
            onChange={handleUpload}
          >
            <Button type="primary" icon={<UploadOutlined />}>上传图片</Button>
          </Upload>
        </div>
        {imageUrl && (
          <div className="image-identify-preview">
            <Image src={imageUrl} alt="上传图片" style={{ maxWidth: 360, borderRadius: 12, boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)' }} preview />
          </div>
        )}
      </div>
      <div className="image-identify-right">
        <Spin spinning={loading} style={{ width: '100%' }}>
          {ocrText && (
            <div className="image-identify-ocr">
              <b style={{ color: '#1976d2', fontSize: 18 }}>识别文字：</b>
              <Paragraph copyable style={{ margin: 0, fontSize: 16, color: '#333' }}>{ocrText}</Paragraph>
            </div>
          )}
        </Spin>
        <Spin spinning={deepSeekLoading} style={{ width: '100%' }}>
          {deepSeekResult && (
            <div className="image-identify-ai">
              <Descriptions
                title="DeepSeek识别结果"
                bordered
                column={1}
                size="middle"
                style={{ marginTop: 0, width: '100%' }}
              >
                <Descriptions.Item label="品种">{deepSeekResult.variety || '-'}</Descriptions.Item>
                <Descriptions.Item label="性状">{deepSeekResult.traits || '-'}</Descriptions.Item>
                <Descriptions.Item label="原始AI回复" span={1}>
                  <Paragraph style={{ margin: 0, fontSize: 14, color: '#888' }}>{deepSeekResult.raw}</Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ImageIdentify; 