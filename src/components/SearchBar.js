import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="flex items-center">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        prefix={<SearchOutlined className="text-gray-400 text-xs" style={{ fontSize: '14px' }} />}
        className="w-full text-xs border rounded-lg focus:outline-none py-2.5 px-3 font-raleway"
        style={{ fontSize: '12px', fontFamily: 'Raleway, sans-serif' }}
      />
    </div>
  );
};

export default SearchBar;