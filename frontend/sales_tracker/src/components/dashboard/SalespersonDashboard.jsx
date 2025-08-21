import React from "react";
import useAuthStore from "../../store/authStore";


const SalespersonDashboard = () => {
    const user = useAuthStore((state) => state.user); // Get user data from the store
    const logout = useAuthStore((state) => state.logout); // Get logout function

    const handleLogout = () => {
        logout();
        // Due to state change, App.jsx will handle redirection to login page
    }

    if (!user) {
        return <div className="text-center text-red-600">User is not authenticated. Redirecting....</div>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl text-center">
            <h1 className="text-3xl font-bold text-gray-700 mb-4">Welcome, Salesperson {user.username}!</h1>
            <p className="text-gray-500 mb-6">This is your dashboard. Here you will see your client list, sales summary, and quick actions.</p>
        
        {/* Placeholder for quick stats and links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg text-blue-700">Today's Sales</h3>
                <p className="text-2xl text-blue-800">shs 0.00</p>
                <button className="text-blue-500 hover:underline text-sm mt-2">View My Clients</button>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg text-yellow-700">Outstanding Payments</h3>
                <p className="text-2xl text-yellow-800">shs 0.00</p>
                <button className="text-yellow-500 hover:underline text-sm mt-2">View Payments</button>
            </div>
        </div>

        <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
            >
                Logout
            </button>
        </div>
    );
};

export default SalespersonDashboard;


