import React, { useEffect, useState } from "react";
import { Button, Input, Card, Menu, Dropdown, Tag } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import JSONInput from "react-json-editor-ajrm/index";
import locale from "react-json-editor-ajrm/locale/en";
import { theme, usePlugin, useValue } from "flipper-plugin";
import { isEqual } from "lodash";

interface Props {
  plugin: any;
  isLinkFlow?: boolean;
  apiUrlMethod?: {
    url?: string;
    method?: string;
  };
}
function CustomEvent({ plugin, isLinkFlow = false, apiUrlMethod = {} }: Props) {
  const indexName = "customEvent"; // Customize your index name
  const instance = usePlugin(plugin);
  const LinkEvent = useValue(instance.LinkEvent);
  const customEventList = useValue<[]>(instance.customEventList)??[];
  const [newJsonName, setNewJsonName] = useState("");

  function generateUniqueName() {
    return `JSON ${customEventList?.length??0 + 1}`;
  }

  const handleAddJson = () => {
    const defaultName = generateUniqueName();
    const temp = [
      ...customEventList,
      { name: defaultName, data: {} },
    ];
    instance.setCustomEventList(temp);
    setNewJsonName("");
  };

  const handleDeleteJson = (index) => {
    const deletedData = customEventList.filter((_, i) => i !== index);
    localStorage.setItem(indexName, JSON.stringify(deletedData));

    instance.setCustomEventList(deletedData);
  };

  const handleDuplicateJson = (index) => {
    const duplicateData = { ...customEventList[index] };
    const temp = [
      ...customEventList,
      ...duplicateData,
    ];
    instance.setCustomEventList(temp)
  };
  const handleJsonEdit = ({ error, jsObject }, index) => {
    const updatedList = [...customEventList];
    if (!error) {
      updatedList[index].data = jsObject;
      instance.setCustomEventList(updatedList);
    }
  };

  const handleNameChange = (event, index) => {
    const newName = event.target.value;
    const updatedList = [...customEventList];
    updatedList[index].name = newName;
    instance.setCustomEventList(updatedList);
  };

  const handleSendJson = (val) => {
    if (isLinkFlow)
      instance.updatelinkEvents({
        [`${apiUrlMethod.method}_${apiUrlMethod.url}`]: val,
      });
    else instance.sendCustomEvents(val);
  };
  const LinkData = LinkEvent?.[`${apiUrlMethod?.method}_${apiUrlMethod?.url}`];
  return (
    <div>
      <div
        style={{
          borderWidth: "5px",
          borderColor: theme.dividerColor,
        }}
      >
        {!!LinkData && (
          <>
            <h2>Current Link Event</h2>
            <JSONInput
              placeholder={LinkData}
              locale={locale}
              colors={{
                string: "#DAA520",
              }}
              theme="light_mitsuketa_tribute"
              height={"200px"}
            />
          </>
        )}
      </div>
      <h2>Add New Events Here </h2>
      <div style={{ marginBottom: "10px" }}>
        <Input
          placeholder="Enter JSON Name"
          value={newJsonName}
          onChange={(e) => setNewJsonName(e.target.value)}
          style={{ marginRight: "10px", marginBottom: "10px" }}
        />
        <Button type="primary" onClick={handleAddJson}>
          Add JSON
        </Button>
      </div>

      {customEventList?.map?.((jsonData, index) => (
        <Card
          key={index}
          style={{ marginBottom: "10px", position: "relative" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Input
              value={jsonData.name}
              onChange={(e) => handleNameChange(e, index)}
              style={{ marginBottom: "5px", border: "none", flexGrow: 1 }}
            />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item onClick={() => handleDuplicateJson(index)}>
                    Duplicate
                  </Menu.Item>
                  <Menu.Item onClick={() => handleDeleteJson(index)}>
                    Delete
                  </Menu.Item>
                </Menu>
              }
              placement="bottomRight"
            >
              <MoreOutlined />
            </Dropdown>
          </div>
          <JSONInput
            placeholder={jsonData.data}
            locale={locale}
            onBlur={(e) => handleJsonEdit(e, index)}
            colors={{
              string: "#DAA520",
            }}
            theme="light_mitsuketa_tribute"
            onChange={(e) => handleJsonEdit(e, index)}
            height={"200px"}
          />
          <Button
            type="primary"
            style={{ position: "absolute", bottom: "10px", right: "10px" }}
            onClick={() => handleSendJson(jsonData.data)}
          >
            {isLinkFlow ? "Link" : "Send"}
          </Button>
        </Card>
      ))}
    </div>
  );
}

export default CustomEvent;
