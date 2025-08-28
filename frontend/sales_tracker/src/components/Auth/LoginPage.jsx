import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Input from '../common/Input';
import Button from '../common/Button';
import useAuthStore from '../../store/authStore'; 

const LoginPage = () => {
  const navigate = useNavigate(); 
  const login = useAuthStore((state) => state.login); // Get the login action from Zustand

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true); // Set loading to true at the start of the API call

    console.log('Attempting login with:', { username, password });

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        // Extract necessary user data and token from the backend response
        const { token, user_id, username: fetchedUsername, role } = data; // Destructure role

        // Store token and user data (including role) in Zustand
        login(token, { id: user_id, username: fetchedUsername, role }); // Pass role to Zustand

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (role === 'salesperson') {
          navigate('/salesperson-dashboard', { replace: true });
        } else {
          // Fallback or specific error for unexpected roles
          setError('Unexpected user role. Please contact support.');
          useAuthStore.getState().logout(); // Log out if role is unexpected
        }
      } else {
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
      <h2 className='text-3xl font-bold text-center text-gray-800 mb-6'>Login to Sales Recorder</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Enter your username'
          required
        />

        <Input
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter your password'
          required
        />

        {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

        <Button type="submit" disabled={loading} className='w-full'>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;