import React, { useState } from 'react'; // Import useState
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Pass toggleSidebar and isSidebarOpen to Header */}
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-grow">
        {/* Pass isSidebarOpen and toggleSidebar to Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Main content area, takes remaining space */}
        <main className={`flex-grow p-6 overflow-y-auto transition-all duration-300 ease-in-out
                          ${isSidebarOpen ? 'lg:ml-0' : ''}`}> {/* Optional: slight adjustment for open sidebar */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;