import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const user = useAuthStore((state) => state.user); // Get user object from authStore
    const logout = useAuthStore((state) => state.logout); // Get logout function
    const navigate = useNavigate(); // For navigation

    const handleLogout = () => {
        logout(); // Clears authentication state
        navigate("/", { replace: true }); // Redirect to login page
    };

    return (
        <header className="bg-blue-700 text-white p-4 shadow-md flex justify-between items-center">
            <div className="flex items-center">
                {/* Hamburger icon for medium and smaller screens */}
                <button
                 onClick={toggleSidebar}
                 className="lg:hidden text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2 mr-4"
                 aria-label="Toggle Navigation"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
            <h1 className="text-2xl font-semibold">Sales Record Management System</h1>
            <div className="flex items-center space-x-4">
                {user && (
                    <span className="text-lg">
                        Welcome, <span className="font-bold">{user.username}</span> ({user.role})
                    </span>
                )}
                <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-200 ease-in-out"
                >
                    Logout
                </button>
            </div>
        </header>
    )
}

export default Header;