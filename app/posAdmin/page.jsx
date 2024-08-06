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

    const [canLogout, setCanLogout] = useState(true);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setIsAdmin(storedRole === 'admin');
    }, [role]);


    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            router.push('/');
        }
    }, []);


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

        // fetchUsers();
    }, []);





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

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const fetchAllProducts = async () => {
        try {
            const response = await axios.get('http://localhost/listing/sampleData.php', {
                params: { type: 'products' }
            });
            setProducts(response.data);
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

            setHasUnsavedTransactions(false);
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

        setHasUnsavedTransactions(false);
        setIsTransactionLoaded(false);
        if (quantityRef.current) {
            quantityRef.current.focus();
        }

    };

    const handleAdminPasswordChange = async (e) => {
        const password = e.target.value;
        setAdminPassword(password);

        if (password.length > 0) {
            try {
                const response = await axios.post('http://localhost/your_endpoint.php', {
                    operation: 'verifyAdminPassword',
                    password: password
                });

                const result = response.data;
                if (result.status === 1) {
                    // Call handleVoidSubmit if password is valid
                    handleVoidSubmit();
                } else {
                    alert('Invalid admin password.');
                }
            } catch (error) {
                console.error('Error verifying admin password:', error);
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
        const userTransactions = savedTransactions.filter(transaction => transaction.username === username);

        let newTransactionId;
        if (userTransactions.length === 0) {
            newTransactionId = 1;
        } else {
            const lastId = Math.max(...userTransactions.map(t => t.id));
            newTransactionId = lastId + 1;
        }

        const dateTime = new Date().toISOString();

        const newTransaction = {
            id: newTransactionId,
            items,
            total,
            username,
            dateTime
        };
        savedTransactions.push(newTransaction);

        localStorage.setItem('savedTransactions', JSON.stringify(savedTransactions));

        const allTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
        const allLastId = Math.max(...allTransactions.map(t => t.id), 0);
        localStorage.setItem('lastTransactionId', allLastId);

        setHasUnsavedTransactions(false);
        setIsTransactionLoaded(false);
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
            alert("Please complete the current transaction before loading another.");
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
            setHasUnsavedTransactions(false);
        } else {
            alert("No matching transaction found or it's not yours.");
        }
    };





    useEffect(() => {
        console.log("Checking logout conditions...");
        if (hasUnsavedTransactions || isTransactionLoaded) {
            console.log("Unsaved transactions or loaded transactions present.");
            setCanLogout(false);
        } else {
            console.log("No transactions present.");
            setCanLogout(true);
        }
    }, [hasUnsavedTransactions, isTransactionLoaded]);



    useEffect(() => {
        const savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];

        const username = getCurrentUsername();
        const userTransactions = savedTransactions.filter(transaction => transaction.username === username);

        if (userTransactions.length > 0) {
            setCanLogout(false);
        } else {
            setCanLogout(true);
        }
    }, []);


    if (isLoggedIn) {
        return null;
    }


    const handleLogout = () => {
        const savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
        const username = getCurrentUsername();

        const userTransactions = savedTransactions.filter(transaction => transaction.username === username);

        if (userTransactions.length > 0) {
            // If there are transactions, prevent logout
            alert("Please save or clear all transactions before logging out.");
            return;
        }


        console.log("Can Logout Check:", canLogout);
        if (!canLogout) {
            alert("Please save or clear all transactions before logging out.");
            return;
        }

        // Proceed with logout
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setFullname('');
        setRole('');
        setIsAdmin(false);

        localStorage.removeItem('name');
        localStorage.removeItem('role');
        localStorage.removeItem('currentUsername');
        localStorage.removeItem('isLoggedIn', 'true');

        router.push('/');
    };







    // const handleRemoveTransaction = (index) => {
    //     const updatedTransactions = savedTransactions.filter((_, i) => i !== index);
    //     localStorage.setItem('savedTransactions', JSON.stringify(updatedTransactions));
    //     setSavedTransactions(updatedTransactions);
    // };

    const resetTransaction = () => {
        setItems([]);
        setTotal(0);
        setHasUnsavedTransactions(false); // Reset flag correctly
        setIsTransactionLoaded(false); // Reset flag correctly
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
            if (event.ctrlKey && event.key === 'F8') {
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


    const [transactions, setTransactions] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {


        axios.post('http://localhost/pos/sales.php', new URLSearchParams({
            operation: 'getZReport'
        }))
            .then(response => {

                if (Array.isArray(response.data)) {
                    setTransactions(response.data);
                } else {
                    console.error('Unexpected data format:', response.data);
                }
            })
            .catch(error => console.error('Error fetching report data:', error));

    }, []);

    const parseDate = (dateString) => {
        return new Date(dateString);
    };

    const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = parseDate(transaction.sale_date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;

        return (
            (!filterName || transaction.user_username === filterName) &&
            (!start || transactionDate >= start) &&
            (!end || transactionDate <= end)
        );
    });

    const getTotalForTransactions = (transactionsList) => {
        return transactionsList.reduce((total, transaction) => total + transaction.sale_totalAmount, 0);
    };

    const getTodayTotal = () => {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const todayTransactions = transactions.filter(transaction => {
            const transactionDate = parseDate(transaction.sale_date);
            return transactionDate >= startOfToday && transactionDate <= endOfToday;
        });

        return getTotalForTransactions(todayTransactions);
    };

    // useEffect(() => {
    //     const handleKeyDown = (event) => {
    //         if (event.key === 'Escape') {
    //             onClose();
    //         }
    //     };

    //     window.addEventListener('keydown', handleKeyDown);

    //     return () => {
    //         window.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, [onClose]);


    const transactionsEndRef = useRef(null);

    useEffect(() => {
        if (transactionsEndRef.current) {
            transactionsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [filteredTransactions]);

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

                <div className='flex flex-col md:flex-grow  '>
                    <div className="bg-gray-900 text-white p-4 shadow-lg w-full md:w-64 md:fixed top-0 left-0 h-full flex flex-col">
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
                    </div>



                    <div className=" bg-[#6F4E37] p-8 ml-0 md:ml-64 h-screen">
                        <div className="flex justify-between items-center mb-6 md:mt-0 ">
                            <h2 className="text-3xl font-bold text-[#FFFDD0] ">Coffee Thingy</h2>

                            <h2 className="text-3xl font-bold text-[#FFFDD0] ">Welcome, {fullname}</h2>
                        </div>


                        {/* <div className="w-full md:w-1/2 p-4 bg-[#FFFDD0] rounded-lg shadow-md">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="mb-4">
                                        <label htmlFor="quantity" className="block text-gray-700 font-bold mb-2">Quantity:</label>
                                        <input
                                            type="text"
                                            id="quantity"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="border text-white rounded-md px-3 py-2 w-full bg-[#6F4E37]"
                                            required
                                            ref={quantityRef}
                                            autoFocus
                                        />

                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="barcode" className="block text-gray-700 font-bold mb-2 ">Barcode:</label>
                                        <input
                                            type="text"
                                            id="barcode"
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                            className="border text-white rounded-md px-3 py-2 w-full bg-[#6F4E37]"
                                            required
                                            ref={barcodeRef}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div> */}

                        <div className='flex justify-between'>

                            <div className="w-[49%] p-4 bg-[#FFFDD0] rounded-lg shadow-md mt-5">
                                <div className="max-h-[270px] overflow-y-auto"> {/* Set max height and enable vertical scrolling */}
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#6F4E37]">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Barcode</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product Name</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No products available</td>
                                                </tr>
                                            ) : (
                                                products.map((product, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap">{product.barcode}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{product.p_name}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end h-[600px]">
                                <div className="w-full md:w-80 p-4 bg-[#FFFDD0] rounded-lg shadow-md flex flex-col">
                                    <div className="mb-4 flex justify-between">
                                        <h3 className="text-2xl text-gray-700 font-bold">Current Sale</h3>
                                        {/* <h3 className="text-5xl text-gray-700 font-bold">Total: ₱{total.toFixed(2)}</h3> */}
                                    </div>
                                    <div className="mb-4 space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Filter by name"
                                            value={filterName}
                                            onChange={e => setFilterName(e.target.value)}
                                            className="border border-gray-300 rounded p-2 w-full"
                                            autoFocus
                                        />
                                        {/* <input
                            type="date"
                            placeholder="Start date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full"
                        />
                        <input
                            type="date"
                            placeholder="End date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full"
                        /> */}
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold">Total of Today's Transactions: ₱{getTodayTotal().toFixed(2)}</h3>
                                        <h3 className="text-xl font-bold">Total for Filtered Transactions: ₱{getTotalForTransactions(filteredTransactions).toFixed(2)}</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {filteredTransactions.length === 0 ? (
                                            <p>No transactions found.</p>
                                        ) : (
                                            filteredTransactions.map((transaction, index) => (
                                                <div key={index} className="border p-4 rounded report-item mb-4">
                                                    <p><strong>User:</strong> {transaction.user_username}</p>
                                                    <p><strong>Date/Time:</strong> {transaction.sale_date}</p>
                                                    <p><strong>Total:</strong> ₱{transaction.sale_totalAmount.toFixed(2)}</p>
                                                    <p><strong>Cash Tendered:</strong> ₱{transaction.sale_cashTendered.toFixed(2)}</p>
                                                    <p><strong>Change:</strong> ₱{transaction.sale_change.toFixed(2)}</p>
                                                    <div>
                                                        <strong>Items:</strong>
                                                        <ul className="list-disc pl-5">
                                                            {transaction.items.map((item, idx) => (
                                                                <li key={idx}>{item.sale_item_quantity} x {item.product_name} - ₱{item.sale_item_price.toFixed(2)}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={transactionsEndRef} /> {/* This element ensures scrolling to bottom */}
                                    </div>
                                </div>
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

            </div>

            {showVoidModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Void Item</h2>
                        <p className="mb-4">Enter the admin password to void the item.</p>
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
                        <button
                            onClick={() => setShowVoidModal(false)}
                            className="bg-gray-300 text-black px-4 py-2 rounded ml-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

        </>
    );
};

export default Dashboard;
