import React from "react";
import {
  PluginClient,
  usePlugin,
  createState,
  Layout,
} from "flipper-plugin";
import { getRequests, storeRequest, deleteDatabase } from "./helper/DBHelper";
import { addOrUpdateResponse } from "./helper/converts";
import BreakPointMock from "./screen/BreakPointMock";
import { Tabs, notification } from "antd";
import { GeneralMock } from "./GeneralMock";
import CustomEvent from "./CustomEvent";
import DbDropdown from './components/DbDropdown'
import {indexNameCustomEvent, indexNameLinkEvent} from './constant'
const { TabPane } = Tabs;

type Data = {
  id: string;
  message?: string;
};

type Events = {
  newData: Data;
  onPingApi: any;
  updateResponse: any;
  breakPointApiDetails: any;
  LinkEventRequest: any;
};
type Method = {
  onPingApi: any;
  breakPointApi: any;
  breakPointResolveApi: any;
  configSet: any;
  customEvents: any;
};
const mockResponses = {
  requests: [],
};
// const dbName = "flipperDB";
const indexNameRequests = "requests";

interface configProps {
  startstopRecording: boolean;
}
export function plugin(client: PluginClient<Events, Method>) {
  const ApiList = createState([]);
  const customEventList = createState([]);
  const LinkEvent = createState({});
  const varientDetails = createState({});
  const breakPointApiDetails = createState({});
  const dbName = createState('', { persist:'dbName', persistToLocalStorage:true});

  const config = createState<configProps>(
    {
      startstopRecording: false,
    },
    {persist:'startstopRecording', persistToLocalStorage:true }
  );
  client.onMessage("LinkEventRequest", (newData) => {
    let linkListSort = LinkEvent.get();  
    linkListSort = linkListSort?.[`${newData?.method}_${newData.url}`];
    if(linkListSort){
      sendCustomEvents(linkListSort)
    }
  })
  
  client.onMessage("updateResponse", (newData) => {
  if(config.get()?.startstopRecording){
    const apiData = addOrUpdateResponse(ApiList.get(), newData);
    if (apiData.method) {
      setApiList(apiData.mockResponses);
      (async function () {
        await storeRequest(apiData.response, apiData.method, dbName.get(), indexNameRequests);
      })();
    }
  } 
  });

  client.onMessage("onPingApi", (newData) => {
    client.send("onPingApi", { requests: ApiList.get() });
    client.send("configSet", { configSet:config.get() });
  });
  function deleteDb() {
    deleteDatabase(dbName.get()).then((event)=>{
      notification.success({
        message: 'Success',
        description: `${dbName.get()} ${event}`,
      });
    })
    .catch((error) => {
      notification.success({
        message: 'Error',
        description: 'Something went wrong',
      });
    });;
    ApiList.set([]);
  }
  client.addMenuEntry({
    action: "clear",

    handler: async () => {
      deleteDb();
    },
    accelerator: "ctrl+l",
  });

  function setApiList(val: never[],isreq=true) {
    console.log("dddd", { ...val });
    if(isreq)
    ApiList.set([...val]);

    client.send("onPingApi", { requests: val });
  }

  function setCustomEventList(inputValue: never[]) {
    customEventList.set([...inputValue]);
    storeRequest({id:1,inputValue}, 'put', dbName.get(), indexNameCustomEvent);
  }


  client.onMessage("breakPointApiDetails", (newData) => {
    breakPointApiDetails.set(newData);
  });

  function setbreakPointApi(inputValue) {
    client.send("breakPointApi", { inputValue });
  }
  function resolvebreakPointApi(inputValue) {
    client.send("breakPointResolveApi", { inputValue });
    breakPointApiDetails.set({});
  }
  function sendCustomEvents(inputValue) {
    client.send("customEvents", { inputValue });
  }
  async function updatelinkEvents(inputValue) {
    const links = LinkEvent.get() ?? {}
    const temp = {id:1,inputValue:{...links, ...inputValue}};
    LinkEvent.set(temp.inputValue) 
    await storeRequest(temp, 'put', dbName.get(), indexNameLinkEvent);
  
  }

  function startstopRecordingHandle() {
    let configSet = config.get();
    configSet.startstopRecording = !configSet.startstopRecording;
    client.send("configSet", { configSet });
    config.set({ ...configSet });
  }

  function setDb(dbNameVal){
    console.log("dbName",dbName.get(),dbNameVal)
    dbName.set(dbNameVal);    
      getRequests(dbNameVal, indexNameRequests)
      .then(setApiList)
      .catch((error) => {
        console.error(error);
      });

      getRequests(dbNameVal, indexNameLinkEvent)
      .then((val)=>{
        LinkEvent.set(val?.[0]?.inputValue) 
      })
      .catch((error) => {
        console.error(error);
      });

      getRequests(dbNameVal, indexNameCustomEvent)
      .then((val)=>{
        customEventList.set(val?.[0]?.inputValue) 
      })
      .catch((error) => {
        console.error(error);
      });
  }
  return {
    dbName,
    LinkEvent,
    ApiList,
    varientDetails,
    breakPointApiDetails,
    config,
    customEventList,
    deleteDb,
    setDb,
    setbreakPointApi,
    resolvebreakPointApi,
    setApiList,
    startstopRecordingHandle,
    sendCustomEvents,
    updatelinkEvents,
    setCustomEventList
  };
}
const MyTabsComponent = ({ plugin }) => {
  const instance = usePlugin(plugin);

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <DbDropdown plugin={plugin} currentDB={instance.setDb}/>
      <Tabs defaultActiveKey="1">
        <TabPane tab="API Mock" key="1">
          <GeneralMock plugin={plugin} />
        </TabPane>
        <TabPane tab="API Intercepting" key="2">
          <BreakPointMock plugin={plugin} />
        </TabPane>
        <TabPane tab="Custom Event mock" key="3">
          <CustomEvent plugin={plugin} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MyTabsComponent;
export function Component() {
  return (
    <Layout.ScrollContainer>
      <MyTabsComponent plugin={plugin} />
    </Layout.ScrollContainer>
  );
}
