"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';


import KeycapActions from '../components/KeycapActions';
import ReportsModal from '../components/ReportsModal';
import TransactionsModal from '../components/TransactionsModal';
import VoidModal from '../components/VoidModal';
import ReportsUserModal from '../components/ReportsUserModal';


const Dashboard = ({ isVisible, onClose }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [quantity, setQuantity] = useState('1');
    const quantityRef = useRef(null);
    const [barcode, setBarcode] = useState('');
    const [product, setProduct] = useState('');
    const [price, setPrice] = useState('');
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [cashTendered, setCashTendered] = useState('');
    const [change, setChange] = useState('');
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('');

    const [showVoidModal, setShowVoidModal] = useState(false);
    const [itemToVoid, setItemToVoid] = useState(null);
    const [adminPassword, setAdminPassword] = useState('');

    const [isVoidModalVisible, setIsVoidModalVisible] = useState(false);

    const [scanning, setScanning] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');

    const [selectedTransactionIndex, setSelectedTransactionIndex] = useState(null);

    const [showReportsModal, setShowReportsModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [isCashInputVisible, setIsCashInputVisible] = useState(false);

    const [showCustomerNameModal, setShowCustomerNameModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [customerName, setCustomerName] = useState('');

    const [showReportsUserModal, setShowReportsUserModal] = useState(false);


    const [hasUnsavedTransactions, setHasUnsavedTransactions] = useState(false);
    const [isTransactionLoaded, setIsTransactionLoaded] = useState(false);


    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setIsAdmin(storedRole === 'admin');
    }, [role]);





    const router = useRouter();

    useEffect(() => {
        const storedName = localStorage.getItem('name');
        if (storedName) {
            setFullname(storedName);
        }

        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setRole(storedRole);
        }

        fetchUsers();
    }, []);

    // const fetchUsers = () => {
    //     axios.get('http://localhost/listing/sampleData.php', {
    //         params: { type: 'users' }
    //     })
    //         .then(response => {
    //             if (Array.isArray(response.data)) {
    //                 setUsers(response.data);
    //                 const usernames = response.data.map(user => user.username);
    //                 setUsernames(usernames);
    //             } else {
    //                 console.error('Response data is not an array:', response.data);
    //             }
    //         })
    //         .catch(error => console.error('Error fetching users:', error));
    // };

    // const handleLogin = (username, password) => {
    //     if (username && password) {
    //         const user = users.find(u => u.username === username && u.password === password);

    //         if (user) {
    //             setIsLoggedIn(true);
    //             localStorage.setItem('name', user.fullname);
    //             localStorage.setItem('role', user.role);
    //             localStorage.setItem('currentUsername', username);
    //             setFullname(user.fullname);
    //             setRole(user.role);
    //             setIsAdmin(user.role === 'admin');
    //         } else {
    //             // alert('Invalid username or password');
    //         }
    //     }
    // };

    // const handleLogout = () => {
    //     if (hasUnsavedTransactions || isTransactionLoaded) {
    //         alert("Please save or clear all transactions before logging out.");
    //         return;
    //     }

    //     setIsLoggedIn(false);
    //     setUsername('');
    //     setPassword('');
    //     setFullname('');
    //     setRole('');
    //     setIsAdmin(false);

    //     localStorage.removeItem('name');
    //     localStorage.removeItem('role');
    //     localStorage.removeItem('currentUsername');
    // };


    const fetchProductDetails = async (barcode) => {
        try {
            const response = await axios.get('http://localhost/listing/sampleData.php', {
                params: { type: 'products' }
            });
            const data = response.data;
            const productDetail = data.find(product => product.barcode === barcode);
            if (productDetail) {
                setProduct(productDetail.p_name);
                setPrice(productDetail.price);
                addItem(productDetail.p_name, productDetail.price);
            } else {
                setProduct('');
                setPrice('');
            }
        } catch (error) {
            console.error('Error fetching product data:', error);
            alert('Error fetching product data.');
        }
    };

    const addItem = (productName, productPrice) => {
        const parsedQuantity = parseFloat(quantity);
        const parsedPrice = parseFloat(productPrice);

        if (parsedQuantity > 0 && productName && productPrice) {
            setItems(prevItems => {
                const existingItemIndex = prevItems.findIndex(item => item.product === productName);

                if (existingItemIndex !== -1) {
                    const updatedItems = prevItems.map((item, index) =>
                        index === existingItemIndex
                            ? {
                                ...item,
                                quantity: item.quantity + parsedQuantity,
                                amount: (item.quantity + parsedQuantity) * parsedPrice
                            }
                            : item
                    );

                    const newTotal = updatedItems.reduce((acc, item) => acc + item.amount, 0);
                    setTotal(newTotal);

                    if (quantityRef.current) {
                        quantityRef.current.focus();
                    }

                    return updatedItems;
                } else {
                    const newItem = {
                        id: prevItems.length + 1, // Incremental ID
                        quantity: parsedQuantity,
                        product: productName,
                        price: parsedPrice,
                        amount: parsedQuantity * parsedPrice
                    };
                    const newItems = [...prevItems, newItem];

                    const newTotal = newItems.reduce((acc, item) => acc + item.amount, 0);
                    setTotal(newTotal);

                    if (quantityRef.current) {
                        quantityRef.current.focus();
                    }

                    return newItems;
                }
            });

            setQuantity('1');
            setBarcode('');
            setProduct('');
            setPrice('');
        } else {
            alert('Quantity must be greater than 0');
        }
    };






    const calculateChange = (cashAmount) => {
        const tendered = parseFloat(cashAmount);
        if (tendered < total) {

            setChange('');
        } else {
            setChange(tendered - total);
        }
    };

    useEffect(() => {
        if (barcode) {
            fetchProductDetails(barcode);
        }
    }, [barcode]);

    useEffect(() => {
        if (cashTendered) {
            calculateChange(cashTendered);
        }
    }, [cashTendered]);

    const handleVoidItems = (itemsToVoid, voidAll = false) => {
        if (role === 'admin') {
            if (voidAll) {
                setItemToVoid(itemsToVoid);
            } else {
                setItemToVoid(itemsToVoid);
            }
            setShowVoidModal(true);
        } else {

            if (voidAll) {
                setItemToVoid(itemsToVoid);
            } else {
                setItemToVoid(itemsToVoid);
            }
            setShowVoidModal(true);
        }
    };


    // const handleVoidSubmit = async (e) => {
    //     e.preventDefault();

    //     try {
    //         const usersResponse = await axios.get('http://localhost/listing/sampleData.php?type=users');
    //         const users = usersResponse.data;

    //         const isValid = users.some(user => user.role === 'admin' && user.password === adminPassword);

    //         if (isValid) {
    //             if (Array.isArray(itemToVoid)) {

    //                 setItems(prevItems => prevItems.filter(item => !itemToVoid.includes(item)));
    //                 const totalToSubtract = itemToVoid.reduce((sum, item) => sum + item.amount, 0);
    //                 setTotal(prevTotal => prevTotal - totalToSubtract);
    //             } else if (itemToVoid) {

    //                 setItems(prevItems => prevItems.filter(item => item !== itemToVoid));
    //                 setTotal(prevTotal => prevTotal - itemToVoid.amount);
    //             }

    //             setShowVoidModal(false);
    //             setAdminPassword('');
    //             setItemToVoid(null);
    //         } else {
    //             alert('Invalid admin password.');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching user data or verifying password:', error);
    //         alert('Error verifying admin password.');
    //     }
    // };


    const handleVoidSubmit = () => {
        if (Array.isArray(itemToVoid)) {
            setItems(prevItems => prevItems.filter(item => !itemToVoid.includes(item)));
            const totalToSubtract = itemToVoid.reduce((sum, item) => sum + item.amount, 0);
            setTotal(prevTotal => prevTotal - totalToSubtract);
        } else if (itemToVoid) {
            setItems(prevItems => prevItems.filter(item => item !== itemToVoid));
            setTotal(prevTotal => prevTotal - itemToVoid.amount);
        }

        setShowVoidModal(false);
        setAdminPassword('');
        setItemToVoid(null);
    };

    const handleAdminPasswordChange = async (e) => {
        const password = e.target.value;
        setAdminPassword(password);

        if (password.length > 0) {
            try {
                const usersResponse = await axios.get('http://localhost/listing/sampleData.php?type=users');
                const users = usersResponse.data;

                const isValid = users.some(user => user.role === 'admin' && user.password === password);

                if (isValid) {
                    handleVoidSubmit();
                } else {
                    // alert('Invalid admin password.');
                }
            } catch (error) {
                console.error('Error fetching user data or verifying password:', error);
                alert('Error verifying admin password.');
            }
        }
    };



    const increaseQuantity = (productName) => {
        setItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.product === productName
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        amount: (item.quantity + 1) * item.price
                    }
                    : item
            );

            const newTotal = updatedItems.reduce((acc, item) => acc + item.amount, 0);
            setTotal(newTotal);
            return updatedItems;
        });
    };

    const decreaseQuantity = (productName) => {
        setItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.product === productName
                    ? {
                        ...item,
                        quantity: Math.max(item.quantity - 1, 1),
                        amount: Math.max(item.quantity - 1, 1) * item.price
                    }
                    : item
            );

            const newTotal = updatedItems.reduce((acc, item) => acc + item.amount, 0);
            setTotal(newTotal);
            return updatedItems;
        });
    };


    const handleSaveTransaction = () => {
        if (items.length === 0) {
            alert("No items to save. Please add items to the transaction.");
            return;
        }

        const username = getCurrentUsername();
        const savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
        const lastId = localStorage.getItem('lastTransactionId') || 0;
        const newTransactionId = parseInt(lastId) + 1;

        const newTransaction = { id: newTransactionId, items, total, username };
        savedTransactions.push(newTransaction);

        localStorage.setItem('savedTransactions', JSON.stringify(savedTransactions));
        localStorage.setItem('lastTransactionId', newTransactionId);

        setHasUnsavedTransactions(false);
        resetTransaction();
    };



    // const handleLoadTransaction = (transactionId) => {
    //     const transactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
    //     const transactionToLoad = transactions.find(transaction => transaction.id === transactionId);

    //     if (transactionToLoad) {
    //         setItems(transactionToLoad.items);
    //         setTotal(transactionToLoad.total);

    //         const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
    //         localStorage.setItem('savedTransactions', JSON.stringify(updatedTransactions));
    //     } else {
    //         alert("No matching transaction found or it's not yours.");
    //     }

    //     setShowModal(false);
    // };



    const handleLoadTransaction = (id) => {
        if (items.length > 0) {
            // alert("Please complete the current transaction before loading another.");
            return;
        }

        const username = getCurrentUsername();
        const savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
        const filteredTransactions = savedTransactions.filter(transaction => transaction.username === username);

        const transactionToLoad = filteredTransactions.find(transaction => transaction.id === id);

        if (transactionToLoad) {
            setItems(transactionToLoad.items);
            setTotal(transactionToLoad.total);
            setIsTransactionLoaded(true);

            const updatedTransactions = savedTransactions.filter(transaction => transaction.id !== id);
            localStorage.setItem('savedTransactions', JSON.stringify(updatedTransactions));

            setSelectedTransactionIndex(null);
        } else {
            alert("No matching transaction found or it's not yours.");
        }
    };







    // const handleRemoveTransaction = (index) => {
    //     const updatedTransactions = savedTransactions.filter((_, i) => i !== index);
    //     localStorage.setItem('savedTransactions', JSON.stringify(updatedTransactions));
    //     setSavedTransactions(updatedTransactions);
    // };

    const resetTransaction = () => {
        setItems([]);
        setTotal(0);
        setHasUnsavedTransactions(false);
        setIsTransactionLoaded(false);
    };



    const handlePaidTransaction = () => {
        const cash = parseFloat(cashTendered);

        if (isNaN(cash) || cash < total) {
            alert('Cash tendered is not sufficient or invalid.');
            return;
        }


        const fullName = localStorage.getItem('name');
        const username = localStorage.getItem('currentUsername');


        const currentDateTime = new Date().toLocaleString();


        const paidTransactions = JSON.parse(localStorage.getItem('paidTransactions')) || [];
        const newTransaction = { items, total, cashTendered: cash, change, fullName, username, dateTime: currentDateTime };
        paidTransactions.push(newTransaction);
        localStorage.setItem('paidTransactions', JSON.stringify(paidTransactions));
        resetTransaction();
        toggleCashInputVisibility();

        if (quantityRef.current) {
            quantityRef.current.focus();
        }
    };




    const handleScan = (barcode) => {
        setScannedBarcode(barcode);

        fetchProductDetails(barcode);
    };

    const getCurrentUsername = () => {

        return localStorage.getItem('currentUsername');
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowVoidModal(false);
            }
        };

        if (showVoidModal) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showVoidModal]);


    const toggleCashInputVisibility = () => {
        setIsCashInputVisible(prevState => !prevState);
        if (quantityRef.current) {
            quantityRef.current.focus();
        }
    };


    const barcodeRef = useRef(null); 3


    const setQuantityRef = (element) => {
        quantityRef.current = element;
        console.log('Quantity ref set:', quantityRef.current);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === '1') {
                event.preventDefault();
                if (quantityRef.current) {
                    quantityRef.current.focus();
                } else {
                    console.error('quantityRef.current is null');
                }
                return;
            }

            if (event.ctrlKey && event.key === '2') {
                event.preventDefault();
                if (barcodeRef.current) {
                    barcodeRef.current.focus();
                } else {
                    console.error('quantityRef.current is null');
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const [showTransactionsModal, setShowTransactionsModal] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'F12') {
                setShowTransactionsModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === '-') {
                setIsVoidModalVisible(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === ',') {
                setShowReportsUserModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowVoidModal(false);

                if (quantityRef.current) {
                    quantityRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            <KeycapActions
                handleVoidItems={handleVoidItems}
                handleSaveTransaction={handleSaveTransaction}
                handlePaidTransaction={handlePaidTransaction}
                handleLoadTransaction={handleLoadTransaction}
                items={items}
                handleLogout={handleLogout}
                setSelectedTransactionIndex={setSelectedTransactionIndex}
                selectedTransactionIndex={selectedTransactionIndex}
                setShowReportsModal={setShowReportsModal}
                isAdmin={isAdmin}
                toggleCashInputVisibility={toggleCashInputVisibility}
            />
            <ReportsModal isVisible={showReportsModal} onClose={() => setShowReportsModal(false)} />
            <TransactionsModal
                isVisible={showTransactionsModal}
                onClose={() => setShowTransactionsModal(false)}
                onLoadTransaction={handleLoadTransaction}
            />

            <ReportsUserModal
                isVisible={showReportsUserModal}
                onClose={() => setShowReportsUserModal(false)}
            />
            <TransactionsModal
                isVisible={showTransactionsModal}
                onClose={() => setShowTransactionsModal(false)}
                onLoadTransaction={handleLoadTransaction}
            />

            <VoidModal
                isVisible={isVoidModalVisible}
                onClose={() => setIsVoidModalVisible(false)}
                items={items}
                onVoidItem={handleVoidItems}
                adminPassword={adminPassword}
                onAdminPasswordChange={handleAdminPasswordChange}
            />


            <div className="flex flex-col md:flex-row min-h-screen">
                {/* {!isLoggedIn && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
                            <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
                            <form onSubmit={handleLogin}>
                                <div className="mb-6">
                                    <label htmlFor="username" className="block text-gray-700 mb-2 text-lg">Username</label>
                                    <select
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            handleLogin(e.target.value, password);
                                        }}
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
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            handleLogin(username, e.target.value);
                                        }}
                                        className="border text-black rounded-md px-4 py-3 w-full text-lg"
                                        id="password"
                                        type="password"
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                )} */}

                {isLoggedIn && (
                    <div className='flex flex-col md:flex-grow  '>
                        {/* <div className="bg-gray-900 text-white p-4 shadow-lg w-full md:w-64 md:fixed top-0 left-0 h-full flex flex-col">
                            <h2 className="text-3xl font-bold mb-6">POS System</h2>
                            <ul className="space-y-4">
                                <li className="text-lg font-semibold hover:text-gray-300">Dashboard</li>
                                <li className="text-lg font-semibold hover:text-gray-300">Sales</li>
                                <li className="text-lg font-semibold hover:text-gray-300">Inventory</li>
                                <li className="text-lg font-semibold hover:text-gray-300">Reports</li>
                            </ul>
                            <div className="mt-auto">
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full"
                                >
                                    Logout
                                </button>
                            </div>
                        </div> */}



                        <div className="flex-grow bg-[#6F4E37] p-8 ">
                            <div className="flex justify-between items-center mb-6 md:mt-8">
                                <h2 className="text-3xl font-bold text-[#FFFDD0] ">Coffee Thingy</h2>

                                <h2 className="text-3xl font-bold text-[#FFFDD0] ">Welcome, {fullname}</h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 ">
                                <div className="w-full md:w-1/2 p-4 bg-gray-200 rounded-lg shadow-md">
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="mb-4">
                                                <label htmlFor="quantity" className="block text-gray-700 font-bold mb-2">Quantity:</label>
                                                <input
                                                    type="number"
                                                    id="quantity"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    className="border text-black rounded-md px-3 py-2 w-full"
                                                    required
                                                    ref={quantityRef} // Correct usage of ref
                                                    autoFocus
                                                />

                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor="barcode" className="block text-gray-700 font-bold mb-2">Barcode:</label>
                                                <input
                                                    type="text"
                                                    id="barcode"
                                                    value={barcode}
                                                    onChange={(e) => setBarcode(e.target.value)}
                                                    className="border text-black rounded-md px-3 py-2 w-full"
                                                    required
                                                    ref={barcodeRef}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="w-full md:w-1/2 p-4 bg-gray-200 rounded-lg shadow-md">
                                    <div className="mb-4 flex justify-between">
                                        <h3 className="text-2xl text-gray-700 font-bold">Current Sale</h3>
                                        <h3 className="text-5xl text-gray-700 font-bold">Total: ${total.toFixed(2)}</h3>
                                    </div>
                                    <div className="overflow-x-auto h-72">
                                        <table className="min-w-full bg-white border text-black border-gray-200 shadow-md rounded-md">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                    <th className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                    <th className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                    <th className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    {/* <th className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                        <td className="px-4 py-2 text-sm ">{item.id}</td>
                                                        <td className="px-4 py-2 text-sm ">{item.quantity}</td>
                                                        <td className="px-4 py-2 text-base">{item.product}</td>
                                                        <td className="px-4 py-2 text-base">${item.price.toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-base">${item.amount.toFixed(2)}</td>
                                                        {/* <td className="px-4 py-2 text-base">
                                                            <button
                                                                onClick={() => handleVoidItems(item)}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                                            >
                                                                Void
                                                            </button>
                                                        </td> */}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>


                                    {isCashInputVisible && (
                                        <div className="mt-4">
                                            <div className="flex justify-end mb-4">
                                                <div className="flex items-center">
                                                    <label htmlFor="cashTendered" className="text-gray-700 font-bold mr-4 flex-shrink-0">Cash:</label>
                                                    <input
                                                        type="number"
                                                        id="cashTendered"
                                                        value={cashTendered}
                                                        onChange={(e) => setCashTendered(e.target.value)}
                                                        className="border text-black rounded-md px-3 py-2 w-32"
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            {change !== '' && (
                                                <div className="mt-4 flex justify-end">
                                                    <h3 className="text-3xl text-gray-700 font-bold">Change: ${change.toFixed(2)}</h3>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* <div className="mt-4 flex justify-between">
                                            <button
                                                type="submit"
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                onClick={handleSaveTransaction}
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                onClick={handlePaidTransaction}
                                            >
                                                Paid
                                            </button>
                                        </div> */}
                                </div>

                            </div>


                            {/* <div className="mb-4">
                                <h2 className="text-lg font-semibold text-[#FFFDD0] mt-5">Load Transaction</h2>
                                <div className="space-y-2">
                                    {JSON.parse(localStorage.getItem('savedTransactions'))?.filter(transaction => transaction.username === getCurrentUsername()).map((transaction, index) => {

                                        const itemDetails = transaction.items
                                            .map(item => `${item.quantity} x ${item.product}`)
                                            .join(', ');
                                        const summary = `${itemDetails} | Total: $${transaction.total.toFixed(2)}`;

                                        const isSelected = index === selectedTransactionIndex;
                                        const buttonClasses = `w-full sm:w-96 ml-0 sm:ml-4 py-2 rounded-lg ${isSelected ? 'bg-blue-700' : 'bg-blue-500'} text-white hover:bg-blue-600 ${items.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`;

                                        return (
                                            <button
                                                onClick={() => handleLoadTransaction(index)}
                                                key={index}
                                                className={buttonClasses}
                                                disabled={items.length > 0}
                                            >
                                                Load Transaction {index + 1} - {summary}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div> */}

                            {showCustomerNameModal && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Enter Customer Name</h2>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="border text-black rounded-md px-3 py-2 w-full mb-4"
                                            placeholder="Customer Name"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveTransaction}
                                            className="bg-blue-500 text-white py-2 px-4 rounded-md"
                                        >
                                            Save Transaction

                                        </button>
                                        <button
                                            onClick={() => setShowCustomerNameModal(false)}
                                            className="bg-red-500 text-white py-2 px-4 rounded-md ml-4"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}



                        </div>
                    </div>
                )}
            </div>

            {showVoidModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Void Item</h2>
                        <p className="mb-4">Are you sure you want to void this item?</p>
                        <div className="mb-4">
                            <label htmlFor="adminPassword" className="block text-gray-700 mb-2">Admin Password</label>
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={handleAdminPasswordChange}
                                id="adminPassword"
                                className="border text-black rounded-md px-3 py-2 w-full"
                                required
                                autoFocus
                            />
                        </div>
                        {/* <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => setShowVoidModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div> */}
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
