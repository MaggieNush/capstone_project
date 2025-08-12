import React, { useState } from 'react'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Set to false initially
}

export default LoginPage