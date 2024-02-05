import React from "react";

import { Dropdown, Menu, Button, Upload, notification } from "antd";
import { SettingOutlined } from "@ant-design/icons";

enum MENU {
  CREATE_API,
  REACORDING,
  JSON_FILE,
  EXPORT,
  DELETE
}

const Settings = ({ onSubmit, startstopRecordingHandle, createNewApi, handleExport, deleteDb }) => {
  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const jsonData = JSON.parse(content);
        onSubmit(jsonData);
        notification.success({
          message: 'Success',
          description: 'File uploaded',
        });
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Incorrect file uploaded',
        });
        console.error("Error reading JSON file:", error);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleMenuClick = (e) => {
    if (e.key == MENU.REACORDING) {
      startstopRecordingHandle();
    } else if (e.key == MENU.CREATE_API) {
      createNewApi();
    } else if(e.key == MENU.EXPORT){
      handleExport()
    } else if(e.key == MENU.DELETE){
      deleteDb()
    }
  };

  const props = {
    beforeUpload: handleBeforeUpload,
    accept: ".json",
  };
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key={MENU.CREATE_API}>Create New Api</Menu.Item>
      <Menu.Item key={MENU.REACORDING}>Start Recording</Menu.Item>
      <Upload {...props}>
        <Menu.Item key={MENU.JSON_FILE}>Import</Menu.Item>
      </Upload>
      <Menu.Item key={MENU.EXPORT}>Export</Menu.Item>
      <Menu.Item key={MENU.DELETE}>Clear</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Button icon={<SettingOutlined />} />
    </Dropdown>
  );
};

export default Settings;
