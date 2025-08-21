import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const isSalesperson = useAuthStore((state) => state.isSalesperson());
    const isAdmin = useAuthStore((state) => state.isAdmin());
    const navigate = useNavigate();



    const handleLinkClick = (path) => {
    if (isSidebarOpen) { // Only close if sidebar is currently open (for mobile)
      toggleSidebar();
    }
    navigate(path); // Navigate to the clicked link
};

    return (
    <>
      {/* Overlay for mobile view when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar} // Close sidebar when clicking outside
        ></div>
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white p-4 flex flex-col shadow-lg
                   transform transition-transform duration-300 ease-in-out
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                   lg:relative lg:translate-x-0 lg:flex`}
      >
        <div className="text-xl font-bold mb-6 text-center">Navigation</div>
        <ul className="space-y-3 flex-grow"> {/* flex-grow to push logout to bottom if needed */}
          {isSalesperson && (
            <>
              <li>
                <NavLink
                  to="/salesperson-dashboard"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={toggleSidebar} // Close sidebar on link click for mobile
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/clients"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  My Clients
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/new-sale"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Record New Sale
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/new-client-request"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Request New Client
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sales-reports"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Sales Reports
                </NavLink>
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li>
                <NavLink
                  to="/admin-dashboard"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manage-salespersons"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Manage Salespersons
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/pending-clients"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Pending Clients
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manage-flavors"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Manage Flavors
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/overall-reports"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-md transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`
                  }
                  onClick={handleLinkClick}
                >
                  Overall Reports
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;