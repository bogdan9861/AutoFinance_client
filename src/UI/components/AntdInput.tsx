import { Input, InputProps } from "antd";
import React from "react";

export const TextInput = ({ ...props }: InputProps) => {
  return (
    <Input
      style={{ borderRadius: 15, padding: "15px 10px", gap: "10px" }}
      {...props}
    />
  );
};

export const PasswordInput = ({ ...props }: InputProps) => {
  return (
    <Input.Password
      style={{ borderRadius: 15, padding: "15px 10px", gap: "10px" }}
      {...props}
    />
  );
};
