import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item.",
  icon = "Inbox",
  action,
  actionLabel = "Add New"
}) => {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name={icon} className="w-8 h-8 text-primary-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        {action && (
          <Button onClick={action} variant="primary">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Empty;