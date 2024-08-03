"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Login = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const storedName = localStorage.getItem('name');
        const storedRole = localStorage.getItem('role');

        if (storedName) setFullname(storedName);
        if (storedRole) setRole(storedRole);

        if (storedRole === 'admin') setIsAdmin(true);

        if (storedName && storedRole) {
            // Redirect to POS if already logged in
            router.push('/pos');
        } else {
            fetchUsers();
        }
    }, []);

    const fetchUsers = () => {
        axios.get('http://localhost/listing/sampleData.php', {
            params: { type: 'users' }
        })
            .then(response => {
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                    const usernames = response.data.map(user => user.username);
                    setUsernames(usernames);
                } else {
                    console.error('Response data is not an array:', response.data);
                }
            })
            .catch(error => console.error('Error fetching users:', error));
    };

    const handleLogin = (username, password) => {
        if (username && password) {
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                setIsLoggedIn(true);
                localStorage.setItem('name', user.fullname);
                localStorage.setItem('role', user.role);
                localStorage.setItem('currentUsername', username);
                setFullname(user.fullname);
                setRole(user.role);
                setIsAdmin(user.role === 'admin');

                // Navigate to the POS page
                router.push('/pos');
            } else {
                // alert('Invalid username or password');
            }
        }
    };

    useEffect(() => {
        if (username && password) {
            handleLogin(username, password);
        }
    }, [username, password]);

    // Render the login form only if not logged in
    if (isLoggedIn) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
                    <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
                    <form>
                        <div className="mb-6">
                            <label htmlFor="username" className="block text-gray-700 mb-2 text-lg">Username</label>
                            <select
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="border text-black rounded-md px-4 py-3 w-full text-lg"
                                id="username"
                                required
                            >
                                <option value="">Select Username</option>
                                {usernames.map((user, index) => (
                                    <option key={index} value={user}>{user}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 mb-2 text-lg">Password</label>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border text-black rounded-md px-4 py-3 w-full text-lg"
                                id="password"
                                type="password"
                                required
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
