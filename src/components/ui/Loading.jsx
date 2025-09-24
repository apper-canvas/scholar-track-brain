import React from "react";

const Loading = ({ rows = 5, showHeader = false }) => {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Table Rows Skeleton */}
        <div className="divide-y divide-gray-200">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="flex justify-end space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;