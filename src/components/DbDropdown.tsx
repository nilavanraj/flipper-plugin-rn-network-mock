import React, { useEffect, useState } from 'react';
import { Select, Modal, Button } from 'antd';
import { isEqual } from "lodash";
import { usePlugin, useValue } from 'flipper-plugin';

const { Option } = Select;

const MySelect = ({plugin, currentDB}) => {
  const indexName = "ENV";
  
  const instance = usePlugin(plugin);
  const dbName = useValue<[]>(instance.dbName);

  const [options, setOptions] = useState(['Default',dbName]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteOption, setDeleteOption] = useState(null);
  const [newDbName, setNewDbName] = useState("");

  useEffect(() => {
    currentDB(dbName);
    const savedData = localStorage.getItem(indexName);
    if (savedData) {
      try {
        setOptions(JSON.parse(savedData));
      } catch (error) {
        console.log("error",error)
      }
    }
  }, []);

  
  const handleSelect = (value) => {
    if (value === '__add__') {
      setShowAddModal(true);
    } else {
      currentDB(value);
    }
  };

  const handleDeleteOption = (value) => {
    setDeleteOption(value);
  };

  const confirmDelete = () => {
    // Ask for confirmation before deleting the option
    Modal.confirm({
      title: 'Confirm Deletion',
      content: `Are you sure you want to delete the option "${deleteOption}"?`,
      onOk() {
        const prevOptions = options.filter((option) => option !== deleteOption)
        localStorage.setItem(indexName, JSON.stringify(prevOptions));
        setOptions(prevOptions);
        currentDB(options[options.length-1])
        setDeleteOption(null); 
      },
      onCancel() {
        setDeleteOption(null);
      },
    });
  };

  const handleAddOption = () => {
    const prevOptions = [...options, newDbName];
    localStorage.setItem(indexName, JSON.stringify(prevOptions));
    setOptions(prevOptions);
    currentDB(newDbName);
    setNewDbName('')
    setShowAddModal(false);
  };

  const handleCancelAdd = () => {
    // Close the modal or form without adding the new option
    setShowAddModal(false);
  };
  const handleInputChange = (event) => {
    setNewDbName(event.target.value);
  };
  return (
    <div>
        {`ENV : `}
      <Select
        showSearch
        filterOption={(option, inputValue) => {
          const { label, value } = option;
          // looking if other options with same label are matching inputValue
          const otherKey = options.filter(
            opt => opt.label === label && opt.value.includes(inputValue)
          );
          return value.includes(inputValue) || otherKey.length > 0;
        }}
        onSelect={handleSelect}
        onDeselect={handleDeleteOption}
        style={{ width: 200 }}
        defaultValue={dbName}
        value={dbName}
      >
        {options.map((option) => (
          <Option key={option} value={option} label={option}>
            <span>{option}</span>
            <Button type="link" onClick={() => handleDeleteOption(option)}>
              X
            </Button>
          </Option>
        ))}
        <Option key="__add__" value="__add__">
          Add New Option
        </Option>
      </Select>

      <Modal
        title="Add New Option"
        visible={showAddModal}
        onOk={handleAddOption}
        onCancel={handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={handleCancelAdd}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddOption}>
            Add
          </Button>,
        ]}
      >
        <input type="text" value={newDbName} onChange={handleInputChange} />
      </Modal>

      {deleteOption && confirmDelete()}
    </div>
  );
};

export default MySelect;
