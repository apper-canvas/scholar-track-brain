import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: "Dashboard", icon: "LayoutDashboard", path: "/" },
    { name: "Students", icon: "Users", path: "/students" },
    { name: "Classes", icon: "BookOpen", path: "/classes" },
    { name: "Grades", icon: "Award", path: "/grades" },
    { name: "Attendance", icon: "Calendar", path: "/attendance" },
    { name: "Reports", icon: "FileText", path: "/reports" }
  ];

  // Desktop Sidebar (static, always visible on lg+)
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Scholar Track</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-900 shadow-sm"
                      : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
                  )
                }
              >
                <ApperIcon
                  name={item.icon}
                  className="mr-3 flex-shrink-0 h-5 w-5"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar (overlay with transform)
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 flex z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 glass"
          onClick={onClose}
        />
        
        {/* Sidebar Panel */}
        <div
          className={cn(
            "relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <ApperIcon name="X" className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Scholar Track</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-900 shadow-sm"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
                    )
                  }
                >
                  <ApperIcon
                    name={item.icon}
                    className="mr-4 flex-shrink-0 h-5 w-5"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;