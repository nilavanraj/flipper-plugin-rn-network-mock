import { Button, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import CustomEvent from "../CustomEvent";
import { usePlugin, useValue } from "flipper-plugin";

const LinkEvents = ({ApiListData, plugin, showLinkEvents, setShowLinkEvents, menuSelected }) => {
  const [apiUrlMethod, setApiUrlMethod] = useState({
    url:'',
    method:''
  });

  useEffect(()=>{
    if(menuSelected){
      const temp = ApiListData?.find?.(exist=>exist?.id ==menuSelected);
      setApiUrlMethod({
        url: temp?.url??'',
        method: temp?.method??''
      })
    }
  },[menuSelected,showLinkEvents,ApiListData])
  
  const handleCancelAdd = () => {
    setShowLinkEvents(false)
  };

  return (
    <Modal
      title="Link Events"
      visible={showLinkEvents}
      onCancel={handleCancelAdd}
      style={{
        minWidth:'80%'
      }}
      footer={[
        <Button key="cancel" onClick={handleCancelAdd}>
          Close
        </Button>,

      ]}
    >
      <CustomEvent plugin={plugin} isLinkFlow apiUrlMethod={apiUrlMethod}/>
    </Modal>
  );
};

export default LinkEvents;
