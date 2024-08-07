"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';



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


    if (isLoggedIn) {
        return null;
    }

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








    // const fetchProductDetails = async (barcode) => {
    //     try {
    //         const response = await axios.get('http://localhost/listing/sampleData.php', {
    //             params: { type: 'products' }
    //         });
    //         const data = response.data;
    //         const productDetail = data.find(product => product.barcode === barcode);
    //         if (productDetail) {
    //             setProduct(productDetail.p_name);
    //             setPrice(productDetail.price);
    //             addItem(productDetail.p_name, productDetail.price);
    //         } else {
    //             setProduct('');
    //             setPrice('');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching product data:', error);
    //         alert('Error fetching product data.');
    //     }
    // };

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchAllProducts();
    }, []);

    useEffect(() => {
        if (quantity && barcode) {
            const product = products.find(prod => prod.prod_id === parseInt(barcode));
            if (product) {
                addItem(product.prod_name, product.prod_price);
            }
        }
    }, [quantity, barcode]);

    const fetchAllProducts = async () => {
        try {
            const response = await axios.post('http://192.168.1.3/pos/products.php', new URLSearchParams({
                operation: 'getAllProduct',
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('Response:', response);
            console.log('Fetched data:', response.data);

            // Ensure response.data is in the correct format
            let data;
            if (typeof response.data === 'string') {
                // Attempt to parse response data if it's a string
                try {
                    data = JSON.parse(response.data);
                } catch (error) {
                    throw new Error('Error parsing JSON data: ' + error.message);
                }
            } else {
                // Use response.data directly if it's already an object/array
                data = response.data;
            }

            // Validate that data is an array
            if (Array.isArray(data)) {
                console.log('Parsed data:', data);
                setProducts(data);
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.error('Error fetching product data:', error);
            alert('Error fetching product data.');
        }
    };





    const addItem = (productName, productPrice) => {
        const parsedQuantity = parseFloat(quantity);
        const parsedPrice = parseFloat(productPrice);

        // Find the product based on the name
        const product = products.find(p => p.prod_name === productName);

        if (!product) {
            toast.error('Product not found');
            return;
        }

        const productId = product.prod_id;

        if (parsedQuantity > 0 && productName && productPrice) {
            setItems(prevItems => {
                const existingItemIndex = prevItems.findIndex(item => item.prod_id === productId);

                let updatedItems;

                if (existingItemIndex !== -1) {
                    updatedItems = prevItems.map((item, index) =>
                        index === existingItemIndex
                            ? {
                                ...item,
                                quantity: item.quantity + parsedQuantity,
                                amount: (item.quantity + parsedQuantity) * parsedPrice
                            }
                            : item
                    );
                } else {
                    const newItem = {
                        prod_id: productId, // Use the prod_id from fetched data
                        quantity: parsedQuantity,
                        product: productName,
                        price: parsedPrice,
                        amount: parsedQuantity * parsedPrice
                    };
                    updatedItems = [...prevItems, newItem];
                }

                const newTotal = updatedItems.reduce((acc, item) => acc + item.amount, 0);
                setTotal(newTotal);

                if (quantityRef.current) {
                    quantityRef.current.focus();
                }

                return updatedItems;
            });

            setQuantity('1');
            setBarcode('');
            if (quantityRef.current) {
                quantityRef.current.focus();
            }
        } else {
            toast.error('Quantity must be greater than 0');
        }
    };








    const [remainingBalance, setRemainingBalance] = useState(0);


    useEffect(() => {
        // Fetch the remaining balance when the component mounts
        const fetchRemainingBalance = async () => {
            try {
                const response = await axios.post('http://192.168.1.3/pos/balance.php',
                    new URLSearchParams({
                        operation: 'getBeginningBalance'
                    }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                console.log('Response data:', response.data); // Log response data
                if (response.data && response.data.beginning_balance !== undefined) {
                    setRemainingBalance(response.data.beginning_balance || 0);
                } else {
                    console.error('Unexpected response format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching beginning balance:', error);
            }
        };




        fetchRemainingBalance();
    }, []);


    const [beginningBalance, setBeginningBalance] = useState(0);

    useEffect(() => {
        const fetchBeginningBalance = async () => {
            try {
                const response = await axios.post('http://192.168.1.3/pos/balance.php', new URLSearchParams({
                    operation: 'getBeginningBalance'
                }), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                if (response.data) {
                    setBeginningBalance(response.data.beginning_balance || 0);
                }
            } catch (error) {
                console.error('Error fetching beginning balance:', error);
            }
        };

        fetchBeginningBalance();
    }, []);




    const updateBeginningBalance = async (newBalance) => {
        try {
            const response = await axios.post('http://192.168.1.3/pos/balance.php', new URLSearchParams({
                operation: 'updateBeginningBalance',
                json: JSON.stringify({ amount: newBalance })
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (response.data) {
                // Handle success (e.g., show a success message or refresh balance)
                console.log('Beginning balance updated successfully.');
            }
        } catch (error) {
            console.error('Error updating beginning balance:', error);
        }
    };





    const calculateChange = (cashAmount) => {
        const tendered = parseFloat(cashAmount);
        const totalAmount = total; // Assuming `total` is the amount to be paid
        if (tendered < totalAmount) {
            setChange('');
        } else {
            const change = tendered - totalAmount;
            setChange(change);
        }
    };

    useEffect(() => {
        if (cashTendered) {
            calculateChange(cashTendered);
        }
    }, [cashTendered]);






    const handleVoidItems = (itemsToVoid, voidAll = false) => {
        console.log("handleVoidItems called with:", itemsToVoid, voidAll);

        if (voidAll) {
            // Set all items to void
            setItemToVoid(items); // Assuming items is the full list of items
            setSelectedItemIndex(null); // No specific item selected
        } else {
            // Set specific item to void
            const index = items.findIndex(item => item === itemsToVoid);
            if (index !== -1) {
                setItemToVoid([itemsToVoid]);
                setSelectedItemIndex(index);
            } else {
                console.log("Item not found in list:", itemsToVoid);
            }
        }
        setShowVoidModal(true);
    };








    const handleAdminPasswordChange = async (e) => {
        const password = e.target.value;
        setAdminPassword(password);

        if (password.length > 0) {
            try {
                const response = await axios.post('http://192.168.1.3/pos/user.php', new URLSearchParams({
                    operation: 'verifyAdminPassword',
                    json: JSON.stringify({ password: password })
                }), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const result = response.data;
                console.log('Server response:', result); // Log the full response

                if (result.status === 1) {
                    handleVoidSubmit(); // Or any other function you need to call
                } else {
                    console.log('Invalid admin password:', result.message);
                    // Optionally reset the password input
                    // setAdminPassword('');
                }
            } catch (error) {
                console.error('Error verifying admin password:', error);
                toast.error('Error verifying admin password.');
            }
        }
    };


    const handleVoidSubmit = () => {
        console.log("itemToVoid:", itemToVoid);
        console.log("selectedItemIndex:", selectedItemIndex);

        if (itemToVoid && itemToVoid.length > 0) {
            if (itemToVoid.length === items.length) {
                // Void all items
                console.log("Voiding all items.");
                setItems([]);
            } else if (selectedItemIndex !== null && selectedItemIndex < items.length) {
                // Void selected item
                console.log("Voiding selected item:", items[selectedItemIndex]);
                setItems(prevItems => prevItems.filter((_, index) => index !== selectedItemIndex));
            } else {
                console.log("No item selected or index out of range.");
            }

            // Close the modal and reset the state
            setShowVoidModal(false);
            setAdminPassword('');
            setItemToVoid(null);
            setSelectedItemIndex(null); // Reset selected item index
            setHasUnsavedTransactions(false);
            setIsTransactionLoaded(false);

            // Focus on the quantity input if available
            if (quantityRef.current) {
                quantityRef.current.focus();
            }
        } else {
            console.log("itemToVoid is null or empty.");
        }
    };








    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'V') {
                if (items.length > 0) {
                    handleVoidItems(items, true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [items]);








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




    const handleLogout = () => {
        const savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
        const username = getCurrentUsername();

        const userTransactions = savedTransactions.filter(transaction => transaction.username === username);

        if (userTransactions.length > 0) {

            alert("Please save or clear all transactions before logging out.");
            return;
        }


        console.log("Can Logout Check:", canLogout);
        if (!canLogout) {
            alert("Please save or clear all transactions before logging out.");
            return;
        }

        if (items.length > 0) {
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
        localStorage.removeItem('isLoggedIn', 'true');


        localStorage.removeItem('name');
        localStorage.removeItem('role');
        localStorage.removeItem('currentUsername');
        localStorage.removeItem('user_id');

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



    const handlePaidTransaction = async () => {
        const cash = parseFloat(cashTendered);

        if (isNaN(cash) || cash < total) {
            alert('Cash tendered is not sufficient or invalid.');
            return;
        }

        const fullName = localStorage.getItem('name');
        const username = localStorage.getItem('currentUsername');
        const userId = localStorage.getItem('user_id'); // Make sure userId is set in localStorage

        if (!userId) {
            alert('User ID is not available.');
            return;
        }

        // Check if there are items in the table
        if (items.length === 0) {
            alert('No items in the transaction. Please add items before proceeding.');
            return;
        }

        const transactionData = {
            master: {
                userId: parseInt(userId),
                cashTendered: cash,
                change,
                totalAmount: total
            },
            detail: items.map(item => ({
                productId: item.prod_id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        // Check if the remaining balance is sufficient to give change
        if (change > beginningBalance) {
            alert('Insufficient balance to give change. Please ensure enough balance is available.');
            return;
        }

        try {
            const response = await axios.post('http://192.168.1.3/pos/sales.php', new URLSearchParams({
                json: JSON.stringify(transactionData),
                operation: 'saveTransaction'
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const result = response.data;
            if (result.success) {
                // alert('Transaction saved successfully.');

                const newBalance = beginningBalance - change + cash;
                await updateBeginningBalance(newBalance);
                setBeginningBalance(newBalance);


                setCashTendered('');
                setChange('');
                resetTransaction();
                toggleCashInputVisibility();

                if (quantityRef.current) {
                    quantityRef.current.focus();
                }
            } else {
                alert(`Failed to save transaction. Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error saving transaction.');
        }
    };



    const calculateTotal = () => {
        const newTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotal(newTotal);
    };

    // Update total when items change
    useEffect(() => {
        calculateTotal();
    }, [items]);






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


    // useEffect(() => {
    //     const handleKeyDown = (event) => {
    //         if (event.ctrlKey && event.key === 'F8') {
    //             setIsVoidModalVisible(true);
    //         }
    //     };

    //     window.addEventListener('keydown', handleKeyDown);

    //     return () => {
    //         window.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, []);

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


    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const itemsRef = useRef([]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'F9') {
                event.preventDefault();
                setSelectedItemIndex(0); // Start selection at the first item
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelectedItemIndex(prevIndex => {
                    if (prevIndex !== null && prevIndex < items.length - 1) {
                        return prevIndex + 1;
                    }
                    return prevIndex;
                });
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelectedItemIndex(prevIndex => {
                    if (prevIndex !== null && prevIndex > 0) {
                        return prevIndex - 1;
                    }
                    return prevIndex;
                });
            } else if (event.key === 'Enter') {
                if (selectedItemIndex !== null) {
                    handleVoidItems(items[selectedItemIndex]); // Pass the selected item
                    setShowVoidModal(true);
                }
            } else if (event.key === 'Escape') {
                setSelectedItemIndex(null); // Deselect item
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemIndex, items]);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Update the time every second

        return () => clearInterval(intervalId); // Clear the interval on component unmount
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

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


            <div className="flex min-h-screen">


                <div className="flex-grow bg-[#FFFDD0] p-4 ">
                    <div className="flex justify-between items-center p-4 bg-[#262673] shadow-md rounded-lg mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-300">Macs Store</h2>
                            <p className="text-xl text-gray-300">{formatDate(currentTime)} - {formatTime(currentTime)}</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-300">Welcome, {fullname}</h2>
                            <p className="text-xl font-medium text-gray-300">Remaining Balance: ₱{beginningBalance.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* md:flex-row */}
                    <div className='flex justify-between'>
                        <div className="w-[40%] h-56 p-4 bg-[#262673] rounded-lg shadow-md">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="mb-4">
                                        <label htmlFor="quantity" className="block text-white font-bold mb-2">Quantity:</label>
                                        <input
                                            type="text"
                                            id="quantity"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="border text-black rounded-md px-3 py-2 w-full bg-gray-300"
                                            required
                                            ref={quantityRef}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="barcode" className="block text-white font-bold mb-2 ">Barcode:</label>
                                        <input
                                            type="text"
                                            id="barcode"
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                            className="border text-black rounded-md px-3 py-2 w-full bg-gray-300"
                                            required
                                            ref={barcodeRef}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="w-[55%] p-4 bg-[#FFFDD0] rounded-lg shadow-md">
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="text-2xl text-gray-700 font-bold">Current Sale</h3>
                                <h3 className="text-3xl text-gray-700 font-bold">Total: ₱{total.toFixed(2)}</h3>
                            </div>
                            <div className="overflow-x-auto h-72">
                                <table className="min-w-full border text-black border-gray-200 shadow-md rounded-md bg-[#262673]">
                                    <thead className="bg-[#262673] text-white">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-base font-medium uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-2 text-left text-base font-medium uppercase tracking-wider">Quantity</th>
                                            <th className="px-4 py-2 text-left text-base font-medium uppercase tracking-wider">Product</th>
                                            <th className="px-4 py-2 text-left text-base font-medium uppercase tracking-wider">Price</th>
                                            <th className="px-4 py-2 text-left text-base font-medium uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? (
                                            items.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`cursor-pointer ${selectedItemIndex === index ? 'bg-yellow-200' : index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
                                                    onClick={() => setSelectedItemIndex(index)}
                                                    ref={el => (itemsRef.current[index] = el)}
                                                >
                                                    <td className="px-4 py-2 text-lg">{item.prod_id}</td>
                                                    <td className="px-4 py-2 text-lg">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-lg">{item.product}</td>
                                                    <td className="px-4 py-2 text-lg">₱{parseFloat(item.price).toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-lg">₱{parseFloat(item.amount).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-2 text-lg text-center text-gray-700 bg-white">No products available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {isCashInputVisible && (
                                <div className="mt-2">
                                    <div className="flex justify-end">
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
                                            <h3 className="text-3xl text-gray-700 font-bold">Change: ₱{change.toFixed(2)}</h3>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>


                    <div className="flex justify-between mt-4 space-x-4">
                        <div className="w-[49%] p-4 bg-[#FFFDD0] rounded-lg shadow-md">
                            <div className="max-h-[270px] overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#262673] text-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Barcode</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product Name</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan="2" className="px-6 py-4 text-center text-gray-700">No products available</td>
                                            </tr>
                                        ) : (
                                            products.map((product, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-lg">{product.prod_id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-lg">{product.prod_name}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="w-[49%] p-4 bg-[#FFFDD0] rounded-lg shadow-md">
                            <div className="max-h-[270px] overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#262673] text-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Barcode</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product Name</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan="2" className="px-6 py-4 text-center text-gray-700">No products available</td>
                                            </tr>
                                        ) : (
                                            products.map((product, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-lg">{product.prod_id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-lg">{product.prod_name}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>


            </div >

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

                    </div>
                </div>
            )
            }
        </>
    );
};

export default Dashboard;
