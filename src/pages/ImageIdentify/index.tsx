import React, { useState } from 'react';
import { Upload, Button, Image, Spin, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.less';
import { imageOcr } from '@/services/Breeding Platform/api';

const { Paragraph } = Typography;

const ImageIdentify: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  //  

  const handleUpload = (info: any) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const fileObj = info.file.originFileObj || info.file;
      const url = URL.createObjectURL(fileObj);
      setImageUrl(url);
      setOcrText('');
      setLoading(true);

      imageOcr(fileObj)
        .then((response) => {
          // 处理不同格式的响应
          const text = response.text || response;
          setOcrText(text);
        })
        .catch((error) => {
          console.error('OCR识别失败:', error);
          message.error('文字识别失败: ' + error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="image-identify-container">
      <div className="image-identify-left">
        <div className="image-identify-title">图片文字识别</div>
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
            <Image
              src={imageUrl}
              alt="上传图片"
              style={{
                maxWidth: 360,
                borderRadius: 12,
                boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)',
                maxHeight: 300,
                objectFit: 'contain'
              }}
              preview
            />
          </div>
        )}
      </div>
      <div className="image-identify-right">
        <Spin spinning={loading} style={{ width: '100%' }}>
          {ocrText ? (
            <div className="image-identify-ocr">
              <b style={{ color: '#1976d2', fontSize: 18, marginBottom: 12, display: 'block' }}>识别结果：</b>
              <div style={{
                background: '#f9f9f9',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #eee',
                maxHeight: 400,
                overflowY: 'auto'
              }}>
                <Paragraph copyable style={{ margin: 0, fontSize: 16, color: '#333', whiteSpace: 'pre-wrap' }}>
                  {ocrText}
                </Paragraph>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300,
              width: 300,
              border: '1px dashed #ddd',
              borderRadius: 8,
              color: '#999'
            }}>
              {loading ? '识别中...' : '识别结果将显示在这里'}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ImageIdentify; 