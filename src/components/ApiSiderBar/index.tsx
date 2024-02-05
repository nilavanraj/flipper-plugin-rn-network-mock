import { Layout, DataInspector,theme } from "flipper-plugin";
import { Input, Typography } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import JsonToFile from "../../helper/JsonToFile";
import { Dropdown, Menu } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

import JSONInput from "react-json-editor-ajrm/index";
import locale from "react-json-editor-ajrm/locale/en";
function ApiSiderBar({
  onClose,
  varientDetails,
  updateVarients,
  onchangeVariant,
}) {
  const [jsonDataList, setJsonDataList] = useState(
    varientDetails?.responseVariations ?? []
  );
  useEffect(() => {
    if (varientDetails?.responseVariations)
      setJsonDataList(varientDetails.responseVariations);
  }, [varientDetails]);

  const handleJsonEdit = ({ error, jsObject }, index) => {
    const updatedList = [...jsonDataList];
    if (!error) {
      setJsonDataList(() => {
        updatedList[index] = jsObject;
        return updatedList;
      });
      updateVarients(updatedList);
    }
  };

  const onsetValue = (paths, val, data) => {
    let newData = JSON.parse(JSON.stringify(data)); // Create a deep copy of the data

    let current = newData;
    for (let i = 0; i < paths.length - 1; i++) {
      if (!current[paths[i]]) {
        current[paths[i]] = {};
      }
      current = current[paths[i]];
    }

    current[paths[paths.length - 1]] = val;
    updateVarients(jsonDataList.map((i) => i.id == newData.id && newData));
    setJsonDataList((pre) => pre.map((i) => i.id == newData.id && newData));

    return true;
  };

  const handleDuplicateJson = (index) => {
    const duplicateData = { ...jsonDataList[index] };
    duplicateData.id = duplicateData.id + 1;
    setJsonDataList((prevList) => [...prevList, duplicateData]);
    updateVarients(jsonDataList);
  };
  const handleDeleteJson = (val) => {
    updateVarients(jsonDataList.filter((_, index) => index != val));
    setJsonDataList(jsonDataList.filter((_, index) => index != val));
  };

  const handleNameChange = (event, index) => {
    const newName = event.target.value;
    const updatedVariations = [...jsonDataList];
    updatedVariations[index].__variation_name__ = newName;
    setJsonDataList(updatedVariations);
  };

const ItemsRender = ({index,item})=>(
  <div key={index}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Input
      defaultValue={item?.__variation_name__ ?? `Variation ${index}`}
      style={{ 
        marginBottom: "5px",
        border: "none",
        flexGrow: 1,
        fontWeight: varientDetails.variant === index?'bold':'',
        color: varientDetails.variant === index?'red':'black',
      
      }}
      onBlur={(e) => handleNameChange(e, index)}
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
          <Menu.Item
            style={{
              backgroundColor:
                varientDetails.variant === index
                  ? "red"
                  : "transparent",
              color:
                varientDetails.variant === index ? "white" : "black",
            }}
            onClick={() => onchangeVariant(index)}
          >
            {varientDetails.variant === index ? `Active Now` : `Active`}
          </Menu.Item>
        </Menu>
      }
      placement="bottomRight"
    >
      <MoreOutlined />
    </Dropdown>
  </div>
  {/* <ReactJson
    src={item}
    onEdit={e => handleJsonEdit(e.updated_src, index)}
    onAdd={e => handleJsonEdit(e.updated_src, index)}
    onDelete={e => handleJsonEdit(e.updated_src, index)}
  /> */}
  <JSONInput
    placeholder={item} // data to display
    locale={locale}
    onBlur={(e) => handleJsonEdit(e, index)}
    colors={{
      string: "#DAA520", // overrides theme colors with whatever color value you want
    }}
    theme="light_mitsuketa_tribute"
    // onChange={(e) => handleJsonEdit(e, index)}
  />

</div>
)

  return (
    <Layout.Container gap pad>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Typography.Title level={4}>Api Details</Typography.Title>
        <CloseCircleOutlined
          onClick={onClose}
          style={{ fontSize: "24px", color: "red" }}
        />
      </div>
      <Button
        type="primary"
        onClick={() => {
          JsonToFile(varientDetails);
        }}
      >
        Download
      </Button>
      {jsonDataList.map((item, index) => (
        <ItemsRender index={index} item={item}/>
      ))}
      {!jsonDataList.length &&         <ItemsRender index={1} item={{}}/>
}
    </Layout.Container>
  );
}

export default ApiSiderBar;
