"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedName = localStorage.getItem('name');
        const storedRole = localStorage.getItem('role');
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (storedName && storedRole && storedIsLoggedIn) {
            setIsLoggedIn(true);
            router.push(storedRole === 'admin' ? '/posAdmin' : '/pos');
        }
    }, [router]);

    const handleLogin = async () => {
        if (username && password) {
            try {
                const response = await axios.post('http://192.168.1.3/pos/user.php', new URLSearchParams({
                    operation: 'loginUser',
                    json: JSON.stringify({ loginUsername: username, loginPassword: password })
                }), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const result = response.data;

                if (result.status === 1) {
                    localStorage.setItem('name', result.data[0].user_fullName);
                    localStorage.setItem('role', result.data[0].user_level);
                    localStorage.setItem('currentUsername', username);
                    localStorage.setItem('user_id', result.data[0].user_id);
                    localStorage.setItem('isLoggedIn', 'true');
                    setIsLoggedIn(true);
                    setIsAdmin(result.data[0].user_level === 'admin');

                    toast.success('Login successful');
                    router.push(result.data[0].user_level === 'admin' ? '/posAdmin' : '/pos');
                } else {
                    toast.error("Login failed");
                }
            } catch (error) {
                console.error("Error logging in:", error);
            }
        }
    };

    useEffect(() => {
        if (username && password) {
            handleLogin();
        }
    }, [username, password]);

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
                    <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                    >
                        <div className="mb-6">
                            <label htmlFor="username" className="block text-gray-700 mb-2 text-lg">Username</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="border text-black rounded-md px-4 py-3 w-full text-lg"
                                id="username"
                                required
                                autoFocus
                            />
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
