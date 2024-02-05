import React from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadFile = ({onSubmit}) => {
  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const jsonData = JSON.parse(content);
        onSubmit(jsonData);
      } catch (error) {
        console.error('Error reading JSON file:', error);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const props = {
    beforeUpload: handleBeforeUpload,
    accept: '.json',
  };

  return (
    <div>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select JSON File</Button>
      </Upload>
    </div>
  );
};

export default UploadFile;
