import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: "home" },
    { path: "/leads", label: "Leads", icon: "document" },
    { path: "/add-users", label: "Add Employees", icon: "user-add" },
    { path: "/attendance", label: "Attendance", icon: "calendar" },
    { path: "/tasks", label: "Tasks", icon: "task" },
    { path: "/template", label: "Template", icon: "template" },
    { path: "/performance", label: "Performance Report", icon: "performance" },
    { path: "/lead_report", label: "Lead Report", icon: "lead_report" },
    { path: "/logout", label: "Logout", icon: "logout" },
  ];

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
        return (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

  return (
    <nav className="bg-[#1e293b] text-white h-screen fixed top-0 left-0 min-w-[250px] py-6 px-4 font-[sans-serif] shadow-lg z-40">
      <div className="relative">
        <div className="w-full flex items-center justify-center mb-8">
          <Link to="/">
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
