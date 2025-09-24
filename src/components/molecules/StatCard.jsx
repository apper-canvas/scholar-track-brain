import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ title, value, icon, trend, trendValue, className }) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold gradient-text mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === "up" ? "text-success-600" : "text-error-600"
            }`}>
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                className="w-4 h-4 mr-1" 
              />
              {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-100 rounded-lg">
            <ApperIcon name={icon} className="w-6 h-6 text-primary-600" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;