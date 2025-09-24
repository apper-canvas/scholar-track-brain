import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const ActionButton = ({ icon, children, ...props }) => {
  return (
    <Button {...props}>
      {icon && <ApperIcon name={icon} className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
};

export default ActionButton;