import React, { useEffect, useRef, useState } from "react";
import { Layout, DetailSidebar, usePlugin, useValue } from "flipper-plugin";
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import ApiSiderBar from "./components/ApiSiderBar";
import {
  storeRequest,
  storeDelete,
} from "./helper/DBHelper";
import Settings from "./components/settings";
import { DownOutlined, MenuOutlined } from "@ant-design/icons";
import { generateUniqueKey } from "./helper/generateUniqueKey";
import JsonToFile from "./helper/JsonToFile";
import { isEqual } from "lodash";
import LinkEvents from "./components/LinkEvents";

enum REQUEST_TYPE {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
  DELETE = "DELETE",
}
enum MENU_TPYE {
  DUPLICATE = "DUPLICATE",
  DELETE = "DELETE",
  FAVORITE = "FAVORITE",
  LINK_EVENTS = "LINK EVENTS",
}
export function GeneralMock({ plugin }) {
  const indexName = "requests";
  const [selectedRowKey, setSelectedRowKey] = useState(null);

  const instance = usePlugin(plugin);
  const ApiList = useValue<[]>(instance.ApiList);
  const customEventList = useValue<[]>(instance.customEventList);
  const LinkEvent = useValue<[]>(instance.LinkEvent);
  const dbName = useValue<"">(instance.dbName);
  const [ApiListData, setApiListData] = useState([]);
  const menuSelectedRef = useRef()

  useEffect(() => {
    if (!isEqual(ApiList, ApiListData)) {
      const temp = ApiList.sort((a, b) => {
        if (a?.__fav__) return -1;
        if (b?.__fav__) return 1;
        return 0;
      });
      setApiListData(temp);
    }
  }, [ApiList]);

  useEffect(() => {
    setTimeout(() => {
      instance.setApiList(ApiList, false);
    }, 0);
  }, [ApiListData]);

  const configSet = useValue<any>(instance.config);

  const [varientDetails, setVarientDetails] = useState<any>(null);
  const [showLinkEvents, setShowLinkEvents] = useState(false);

  const currentVarirantIndex = useRef();

  async function updateJson(inputArray) {
    const tempApiListData = [...ApiListData];
    inputArray?.ApiListData?.forEach(async (item) => {
      const existingIndex = ApiListData.findIndex(
        (existing) =>
          existing.url === item.url && existing.method === item.method
      );
      let method = "add";
      if (existingIndex !== -1) {
        method = "put";
        tempApiListData[existingIndex] = item;
      } else {
        tempApiListData.push(item);
      }

      await storeRequest(item, method, dbName, indexName);
    });
    instance.updatelinkEvents(inputArray?.LinkEvent ?? {});
    instance.setCustomEventList(inputArray?.customEventList ?? {});
    setApiListData(tempApiListData);
  }

  function onChangeSearchApi(val) {
    let result = [...ApiListData].filter((item) => {
      return item.url?.toLowerCase().includes(val.target.value.toLowerCase());
    });
    if (result.length === 0 && val.length === 0) result = ApiListData;
    setApiListData(result);
  }

  function handleSetVarientDetails(id) {
    currentVarirantIndex.current = id;
    const existingRequest = ApiListData.find((request) => {
      return request.id === id;
    });

    setVarientDetails(existingRequest);
  }

  function updateVarients(data: any) {
    let temp = {};
    const existingRequest = ApiListData.map((request) => {
      if (request.id === currentVarirantIndex.current) {
        request.responseVariations = data;
        temp = request;
      }
      return request;
    });
    setApiListData(existingRequest);
    setVarientDetails(temp);
    (async function () {
      await storeRequest(temp, "put", dbName, indexName);
    })();
  }

  const handleEditFieldChange = (e, fieldName, key) => {
    const newData = [...ApiListData];
    const index = newData.findIndex((item) => key === item.id);
    if (index > -1) {
      newData[index][fieldName] = e.target.value;
      setApiListData(newData);
      storeRequest(newData[index], "put", dbName, indexName);
    }
  };

  const handleDeleteFieldChange = (key) => {
    const newData = [...ApiListData];
    const item = newData.filter((item) => key !== item.id);
    if (item.length) {
      setApiListData(item);
      storeDelete(key, dbName, indexName);
    }
  };

  function onchangeVariant(index: any) {
    let temp = {};
    const existingRequest = ApiListData.map((request) => {
      if (request.id === currentVarirantIndex.current) {
        request.variant = index;
        temp = request;
      }
      return request;
    });
    setApiListData(existingRequest);
    setVarientDetails(temp);
    (async function () {
      await storeRequest(temp, "put", dbName, indexName);
    })();
  }

  const colorStyles = {
    get: "#00FF00",

    post: "#0000FF",

    put: "#FFA500",

    delete: "#FF0000",
  };

  const columns = [
    {
      title: "url",
      dataIndex: "url",
      key: "url",
      render: (text, record) => (
        <div>
          {record?.__fav__ && <Tag>FAV</Tag>}
          <Input.TextArea
            value={text}
            autoSize={{ minRows: 2, maxRows: 4 }}
            onBlur={(e) => {
              handleEditFieldChange(e, "url", record.id);
            }}
          />
        </div>
      ),
    },
    {
      title: "method",
      dataIndex: "method",
      key: "method",
      render: (e, { method, id }) => (
        <Space size="middle" style={{ alignItems: "center" }}>
          <Dropdown overlay={getMethod(id)} trigger={["click"]}>
            <Tag
              className="ant-dropdown-link"
              color={colorStyles[method.toLowerCase()]}
              onClick={(e) => e.preventDefault()}
            >
              {method.toUpperCase()} <DownOutlined />
            </Tag>
          </Dropdown>
        </Space>
      ),
    },
    {
      title: "variant",
      dataIndex: "variant",
      key: "variant",
      onCell: (record, rowIndex) => {
        return {
          onClick: (ev) => {
            handleSetVarientDetails(record.id);
          },
        };
      },
      render: (_, { variant, responseVariations }) => {
        const variantName =
          responseVariations[variant]?.__variation_name__ || "DEFAULT";

        return (
          <Tag key={variant} style={{ textAlign: "center" }}>
            {variantName}
          </Tag>
        );
      },
    },
    {
      title: "Mock Status",
      key: "activestatus",
      render: (_, { id, __mock_status__ }) => {
        const mockStausVal = __mock_status__;
        return (
          <Switch
            checked={mockStausVal}
            onChange={() => {
              mockStaus(id, !mockStausVal);
            }}
          />
        );
      },
    },

    {
      title: "",
      key: "action",
      render: (_, { id }) => (
        <Space size="middle">
          <Dropdown overlay={getOption(id)} trigger={["click"]}>
            <Tag
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              <MenuOutlined />
            </Tag>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const createNewApi = () => {
    const template = {
      id: generateUniqueKey(),
      url: "https://dummyapi.com/",
      method: "GET",
      variant: 0,
      __mock_status__: true,
      responseVariations: [
        {
          id: 1,
          status: 200,
          body: {},
        },
      ],
    };
    const newData = [...ApiListData];
    const length = newData.length;
    newData[length] = template;
    setApiListData(newData);
    storeRequest(newData[length], "add", dbName, indexName);
  };

  const methodChange = (id, e) => {
    const newData = [...ApiListData];
    const index = newData.findIndex((item) => id === item.id);
    if (index > -1) {
      newData[index].method = e.key;
      setApiListData(newData);
      storeRequest(newData[index], "put", dbName, indexName);
    }
  };

  const mockStaus = (id, e) => {
    const newData = [...ApiListData];
    const index = newData.findIndex((item) => id === item.id);
    if (index > -1) {
      newData[index].__mock_status__ = e;
      setApiListData(newData);
      storeRequest(newData[index], "put", dbName, indexName);
    }
  };

  const addDuplicate = (id) => {
    const newData = [...ApiListData];
    const index = newData.findIndex((item) => id === item.id);
    if (index > -1) {
      newData[index + 1] = { ...newData[index], id: generateUniqueKey() };
      setApiListData(newData);
      storeRequest(newData[index + 1], "add", dbName, indexName);
    }
  };

  const addFavorite = (id) => {
    const newData = [...ApiListData];
    const index = newData.findIndex((item) => id === item.id);
    if (index > -1) {
      newData[index].__fav__ = !newData[index]?.__fav__;
      setApiListData(newData);
      storeRequest(newData[index], "put", dbName, indexName);
    }
  };
  const linkEventModal = (val:boolean) => {
    setShowLinkEvents(val)
  };

  const optionChange = (id, e) => {
    switch (e.key) {
      case MENU_TPYE.DELETE:
        handleDeleteFieldChange(id);
        break;
      case MENU_TPYE.DUPLICATE:
        addDuplicate(id);
        break;
      case MENU_TPYE.FAVORITE:
        addFavorite(id);
        break;
      case MENU_TPYE.LINK_EVENTS:
        menuSelectedRef.current = id;
        linkEventModal(true);
        break;
    }
  };
  const getMethod = (record) => (
    <Menu
      className="ant-dropdown-link"
      onClick={(e) => methodChange(record, e)}
    >
      <Menu.Item key={REQUEST_TYPE.GET}>{REQUEST_TYPE.GET}</Menu.Item>
      <Menu.Item key={REQUEST_TYPE.POST}>{REQUEST_TYPE.POST}</Menu.Item>
      <Menu.Item key={REQUEST_TYPE.PUT}>{REQUEST_TYPE.PUT}</Menu.Item>
      <Menu.Item key={REQUEST_TYPE.DELETE}>{REQUEST_TYPE.PUT}</Menu.Item>
    </Menu>
  );
  const getOption = (record) => (
    <Menu
      className="ant-dropdown-link"
      onClick={(e) => optionChange(record, e)}
    >
      <Menu.Item key={MENU_TPYE.DUPLICATE}>{MENU_TPYE.DUPLICATE}</Menu.Item>
      <Menu.Item key={MENU_TPYE.DELETE}>{MENU_TPYE.DELETE}</Menu.Item>
      <Menu.Item key={MENU_TPYE.FAVORITE}>{MENU_TPYE.FAVORITE}</Menu.Item>
      <Menu.Item key={MENU_TPYE.LINK_EVENTS}>{MENU_TPYE.LINK_EVENTS}</Menu.Item>
    </Menu>
  );
  const handleRowClick = (record, rowIndex, e) => {
    const isDropdownClick = e?.target.closest(".ant-dropdown-link");
    if (!isDropdownClick) {
      const newSelectedRowKey = selectedRowKey === record.id ? null : record.id;
      handleSetVarientDetails(record.id);
      setSelectedRowKey(newSelectedRowKey);
    }
  };
  const handleExport = () =>{
    JsonToFile({ApiListData,customEventList, LinkEvent})
  }
  return (
    <>
      <div style={{ padding: 10 }}>
        {configSet.startstopRecording && (
          <Button
            style={{ margin: 5 }}
            type="primary"
            onClick={instance.startstopRecordingHandle}
          >
            {"Stop Recording"}
          </Button>
        )}
        <div
          style={{
            display: "flex",
            flex: 10,
            paddingBottom: 10,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Input
            onChange={onChangeSearchApi}
            style={{ flex: 9 }}
            placeholder="Search Api"
          />
          <Settings
            createNewApi={createNewApi}
            startstopRecordingHandle={instance.startstopRecordingHandle}
            onSubmit={updateJson}
            handleExport={handleExport}
            deleteDb={instance.deleteDb}
          />
        </div>
        <Table
          onRow={(record, rowIndex) => ({
            onClick: (event) => handleRowClick(record, rowIndex, event),
            style: {
              background: selectedRowKey === record.id ? "#e6f7ff" : "",
            },
          })}
          dataSource={ApiListData}
          columns={columns}
        />
      </div>
      <DetailSidebar>
        {varientDetails && (
          <ApiSiderBar
            onClose={() => {
              setVarientDetails(null);
            }}
            varientDetails={varientDetails}
            updateVarients={updateVarients}
            onchangeVariant={onchangeVariant}
          />
        )}
      </DetailSidebar>
      <LinkEvents ApiListData={ApiListData} plugin={plugin} showLinkEvents={showLinkEvents} setShowLinkEvents={linkEventModal} menuSelected={menuSelectedRef.current}/>
    </>
  );
}
