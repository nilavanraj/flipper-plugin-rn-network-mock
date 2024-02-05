import React, { useState, useEffect } from 'react';
import { Input, Button, Spin } from 'antd';
import { usePlugin, useValue } from 'flipper-plugin';
import ReactJson from 'react-json-view'

interface Props {
    plugin:any
}

function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
  }

const BreakPointMock = ({plugin}:Props) => {
    const instance = usePlugin(plugin);
    const breakPointApiDetails = useValue(instance.breakPointApiDetails) ?? null;
    
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let countdownInterval: string | number | NodeJS.Timer | undefined;

    if (isSubmitting) {
      countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            instance.resolvebreakPointApi(inputValue)
            setIsSubmitting(false);
            clearInterval(countdownInterval);
            return 0;
          }
        });
      }, 1000);
    } else {
      clearInterval(countdownInterval);
      setCountdown(60);
    }

    return () => {
      clearInterval(countdownInterval);
    };
  }, [isSubmitting]);

  useEffect(()=>{
    if(!isEmpty(breakPointApiDetails)){
        setIsSubmitting(true);
        setCountdown(60);
    }
    setInputValue(breakPointApiDetails)
  },[breakPointApiDetails])

  const handleInputChange = (e) => {
    instance.setbreakPointApi(e.target.value)
  };

  const handleSubmit = () => {
    instance.resolvebreakPointApi(inputValue)
    setIsSubmitting(false);
    setCountdown(60);
  };

  const onAdd = (val) =>{
    setInputValue(val.updated_src)
    return true
  }
  const onEdit = (val) =>{
    setInputValue(val.updated_src)
    return true
  }
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        {isSubmitting && <Spin style={{ marginRight: '8px' }} />}
        {isSubmitting ? `Submitting... Countdown: ${countdown} seconds` : 'Not submitting'}
      </div>
      <Input
        placeholder="Enter text here"
        onChange={handleInputChange}
      />
      {!isEmpty(breakPointApiDetails)&&<>
        <ReactJson src={breakPointApiDetails} onAdd={onAdd} onEdit={onEdit}/>
        <Button type="primary" onClick={handleSubmit}>
        Sent Now 🔥
      </Button>
      </>}
     
      
    </div>
  );
};

export default BreakPointMock;
