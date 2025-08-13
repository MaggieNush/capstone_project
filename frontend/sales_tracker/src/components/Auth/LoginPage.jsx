import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Set loading to true at the start of the API call

    console.log('Username state:', username);
    console.log('Password state:', password);
    console.log('JSON payload being sent', JSON.stringify({ username, password }));

    try {
      // Django API login endpoint
      const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        console.log('Login successful:', data);
        // TODO: Replace alert() with a custom modal/notification
        // alert('Login successful! Check console for token and user data.'); 
        console.log('Login successful! Now integrate with Zustand and redirect.');
        // TODO: Store token and user role (e.g., using Zustand)
        // TODO: Redirect to dashboard based on role (this will be done in the next step with Zustand)
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

        {/* REMOVED: Redundant onClick={handleSubmit} - form's onSubmit handles this */}
        <Button type="submit" disabled={loading} className='w-full'>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;