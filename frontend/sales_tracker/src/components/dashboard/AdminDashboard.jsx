import React from "react";
import useAuthStore from "../../store/authStore";

const AdminDashboard = () => {
    const user = useAuthStore((state) => state.user); // Get user data from authStore
    const logout = useAuthStore((state) => state.logout); // Get logout function

    const handleLogout = () => {
        logout();
    };

    if (!user) {
        return <div className="text-center text-red-600">User is not authenticated. Redirecting....</div>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full mex-w-4xl text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, Admin {user.username}!</h1>
            <p className="text-gray-600 mb-6">This is your Admin Dashboard. Here you can manage salespersons, clients, and view overall reports.</p>
        
        {/* Placeholder for quick stats and links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg text-purple-700">Total Salespersons</h3>
                <p className="text-2xl text-purple-900">0</p>
                <button className="text-purple-500 hover:underline text-sm mt-2">Manage Salespersons</button>
            </div>
            <div className="bg-orange-50 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg text-orange-700">Pending Clients</h3>
                <p className="text-2xl text-orange-900">0</p>
                <button className="text-orange-500 hover:underline text-sm mt-2">Review Pending Clients</button >
            </div>
            <div className="bg-teal-50 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg text-teal-700">Total Orders</h3>
                <p className="text-2xl text-teal-900">0</p>
                <button className="text-teal-500 hover:underline text-sm mt-2">View Overall Reports</button>
            </div>
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
        >
            Logout
        </button>
        </div>
    );
};

export default AdminDashboard;
