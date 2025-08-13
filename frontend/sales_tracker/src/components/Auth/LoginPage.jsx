import React, { use, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import useAuthStore from '../../store/authStore';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get login information from authStore
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate(); // Initialize navigation hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Set loading to true at the start of the API call

    // Debugging logs
    console.log('---Debugging login payload---');
    console.log('Username state:', username);
    console.log('Password state:', password);
    const payload = { username, password };
    console.log('Raw payload object:', payload);
    const jsonPayload = JSON.stringify(payload);
    console.log('JSON payload:', jsonPayload);
    console.log('---End of Debugging Logs---');


    try {
      // Django API login endpoint
      const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonPayload, // Use the JSON payload directly
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        console.log('Login successful:', data);

        // Store token and user role (e.g., using Zustand)
        const userData = {
            id: data.user_id,
            username: data.username,
            role: data.role, // Assuming the API returns a role field
        };
        login(data.token, userData); // Call the login action from authStore

        // Redirect based on user role
        if (data.role === 'admin') {
            navigate('/admin-dashboard'); // Redirect to admin dashboard
        } else if (data.role === 'salesperson') {
            navigate('/sales-dashboard'); // Redirect to salesperson dashboard
        } else {
            // Fallbacks for unexpected roles
            setError('Unexpected user role. Please contact support.');
            useAuthStore.getState().logout(); // Clear session if role is unexpected
        }
      } else {
        // Handle login errors
        // Check for specific error messages from Django REST Framework
        setError(data.detail || data.non_field_errors?.[0] || 'Login failed. Please check your credentials.');
        console.error('Login error:', data);
      }
    } catch (err) {
      console.error('Network or unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false); // Reset loading state regardless of success or failure
    }
  };

  return (
    <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
      {/* Updated title for consistency */}
      <h2 className='text-3xl font-bold text-center text-gray-800 mb-6'>Login to Sales Recorder</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          id="username"
          type="text" // Explicitly setting type for username
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Enter your username'
          required
        />

        {/* Ensures password characters are hidden */}
        <Input
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter your password'
          required
        />

        {/* Adjusted margin for better spacing */}
        {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

        <Button type="submit" disabled={loading} className='w-full'>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;