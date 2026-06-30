import React from "react";
import { Link, useLocation } from "react-router-dom";

export const VerticalNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath.startsWith('/gym-owner') || currentPath.startsWith('/trainer/')) return null;

  const menuItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Gyms",
      path: "/gyms",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "Trainers",
      path: "/trainers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Health Store",
      path: "/categories",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "Orders",
      path: "/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);
    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, []);

  // Broadcast toggle event to App.jsx to adjust page padding
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("sidebar-collapse-change", { detail: !isOpen }));
  }, [isOpen]);

  return (
    <>
      {/* Floating Hamburger Toggle (Visible only when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-[100] flex items-center justify-center w-10 h-10 rounded-full bg-[#FF7A00] text-white shadow-[0_0_15px_rgba(255,122,0,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"
          title="Open Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-screen z-[100] bg-black/95 lg:bg-black/85 backdrop-blur-xl border-l border-white/10 flex flex-col items-center justify-between py-6 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-[100px]`}
      >
        {/* Top Header & Collapse Toggle Button */}
        <div className="w-full flex items-center justify-center px-4 mt-2">
          {/* Close button (Cross icon) */}
          <button
            className="text-gray-400 hover:text-[#FF7A00] transition-colors"
            onClick={() => setIsOpen(false)}
            title="Close Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-grow flex flex-col justify-center gap-2 lg:gap-5 w-full px-2 mt-4">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path.split('#')[0];
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all duration-300 relative group w-full ${
                  isActive
                    ? "text-[#FF7A00] bg-[#FF7A00]/10 shadow-[inset_0_0_12px_rgba(255,122,0,0.15)] border-r-2 border-[#FF7A00]"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.02] border-r-2 border-transparent lg:hover:border-[#FF7A00]/50"
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                    isActive ? "text-[#FF7A00]" : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </div>

                {/* Text Label */}
                <span className="text-[10px] font-medium tracking-wide mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const MobileBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath.startsWith('/gym-owner') || currentPath.startsWith('/trainer/')) return null;

  const menuItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Gyms",
      path: "/gyms",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "Trainers",
      path: "/trainers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Health Store",
      path: "/categories",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "Orders",
      path: "/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex lg:hidden fixed bottom-0 left-0 w-full h-[70px] z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 justify-around items-center px-4 shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
      {menuItems.map((item) => {
        const isActive = currentPath === item.path.split('#')[0];
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 relative ${isActive ? "text-[#FF7A00]" : "text-gray-400"
              }`}
          >
            <div className={`p-1 transition-transform ${isActive ? "scale-110" : ""}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-medium tracking-wide mt-0.5">{item.name}</span>
            {isActive && (
              <div className="absolute -bottom-1.5 w-5 h-1 rounded-full bg-[#FF7A00] shadow-[0_0_10px_rgba(255,122,0,0.8)]"></div>
            )}
          </Link>
        );
      })}
    </div>
  );
};
