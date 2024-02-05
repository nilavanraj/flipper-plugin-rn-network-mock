import React from 'react';
import { Card } from 'antd';
import './styles.css'; 


const Index = ({ method, url, setvarientDetails }) => {
  return (
    <div className="custom-card" onClick={setvarientDetails}>
      <div className="card-container">
        <div className={`section1 ${method?.toLowerCase()}`}>
          <h2 className="method-label">{method}</h2>
        </div>
        <div className="method-urlName">
          <h2>{url}</h2>
        </div>
      </div>
    </div>
  );
};

export default Index;
