import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const employeeRole = localStorage.getItem("employeeRole");

  const managerNavItems = [
    { path: "/", label: "Dashboard", icon: "home" },
    { path: "/leads", label: "Leads", icon: "document" },
    { path: "/add-users", label: "Add Employees", icon: "user-add" },
    { path: "/attendance", label: "Attendance", icon: "calendar" },
    { path: "/tasks", label: "Tasks", icon: "task" },
    { path: "/template", label: "Template", icon: "template" },
    { path: "/lead-statuses", label: "Lead Statuses", icon: "lead_report" },
    { path: "/operations", label: "Operations", icon: "operations" },
    { path: "/performance", label: "Performance Report", icon: "performance" },
    { path: "/lead_report", label: "Lead Report", icon: "lead_report" },
    { path: "/settings", label: "Settings", icon: "settings" },
    { path: "/logout", label: "Logout", icon: "logout" },
  ];
  const operationsNavItems = [
    { path: "/operations", label: "Operations", icon: "operations" },
    { path: "/logout", label: "Logout", icon: "logout" },
  ];
  const defaultNavItems = [
    { path: "/logout", label: "Logout", icon: "logout" },
  ];

  const navItems =
    employeeRole === "operations"
      ? operationsNavItems
      : employeeRole === "manager"
      ? managerNavItems
      : defaultNavItems;

  const getIcon = (icon) => {
    switch (icon) {
      case "home":
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10h4m10-10v10h-4" />
          </svg>
        );
      case "document":
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
        );
      case "user-add":
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v6m3-3h-6m-3 0a4 4 0 11-8 0 4 4 0 018 0zM4 21v-1a4 4 0 014-4h4" />
          </svg>
        );
      case "calendar":
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "task":
      case "template":
      case "performance":
      case "lead_report":
      case "operations":
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "settings":
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "logout":
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        );
      default:
        return null;
    }
  };

  // 👇 fetch from localStorage
  const name = localStorage.getItem("name") || "Guest";
  const email = localStorage.getItem("email") || "No email";
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-[#1e293b] text-white h-screen fixed top-0 left-0 min-w-[250px] py-6 px-4 font-[sans-serif] shadow-lg z-40">
      <div className="relative">
        <div className="w-full flex items-center justify-center mb-8">
          <Link to={employeeRole === "operations" ? "/operations" : "/"}>
            <div className="flex items-center justify-center bg-white p-2 rounded-lg">
              <img src="/logo.png" alt="logo" className="w-[160px] object-contain" />
            </div>
          </Link>
        </div>
      </div>

      <div className="overflow-auto py-4 h-full">
        <ul className="space-y-2">
          {navItems.map(({ path, label, icon }) => (
            <li key={path}>
              {path === "/logout" ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center rounded-lg px-4 py-3 transition-all text-blue-100 hover:bg-blue-700 hover:text-white"
                >
                  {getIcon(icon)}
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ) : (
                <Link
                  to={path}
                className={`flex items-center rounded-lg px-4 py-3 transition-all ${
                  isActive(path)
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
                >
                  {getIcon(icon)}
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* 👇 Bottom profile section (dynamic) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{name}</p>
              <p className="text-xs text-blue-200">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
