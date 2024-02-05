import React from "react";
import {
  Layout,
  DetailSidebar,
} from "flipper-plugin";
import {  Input } from "antd";
import ApiCards from "./components/ApiCards";
import ApiSiderBar from "./components/ApiSiderBar";
import UploadFile from "./components/UploadFile";

export function GeneralMock({ApiList, instance, varientDetails}) {

  return (
    <>
      <div style={{ padding: 10 }}>
        <div style={{ flex: 10, padding: 10, flexDirection: "column" }}>
          <Input
            onChange={instance.onChangeSearchApi}
            style={{ flex: 9 }}
            placeholder="Search Api"
          />
          <UploadFile onSubmit={instance.updateJson} />
        </div>

        {ApiList?.map?.((id, d) => (
          <pre key={d} data-testid={d}>
            <ApiCards
              url={id.url}
              method={id.method}
              setvarientDetails={() => {
                instance.setvarientDetails(id.id);
              }}
            />
          </pre>
        ))}
      </div>
      <DetailSidebar>
        {varientDetails && ApiSiderBar(varientDetails, instance.changeVarients)}
      </DetailSidebar>
    </>
  );
}
