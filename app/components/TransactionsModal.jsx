"use client";

import React, { useState, useEffect, useRef } from 'react';

const TransactionsModal = ({ isVisible, onClose, onLoadTransaction }) => {
    const [transactions, setTransactions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [focused, setFocused] = useState(false);
    const transactionsRef = useRef([]);
    const [inputId, setInputId] = useState('');
    const getCurrentUsername = () => {
        return localStorage.getItem('currentUsername');
    };

    useEffect(() => {
        if (isVisible) {
            const savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
            const currentUser = getCurrentUsername();
            const userTransactions = savedTransactions.filter(transaction => transaction.username === currentUser);
            setTransactions(userTransactions);
        }
    }, [isVisible]);

    useEffect(() => {
        if (inputId) {
            const transactionToLoad = transactions.find(transaction => transaction.id === parseInt(inputId));
            if (transactionToLoad) {
                onLoadTransaction(transactionToLoad.id);
                setSelectedIndex(null); // Clear selected index
                onClose(); // Close the modal
            }
        }
    }, [inputId, transactions, onLoadTransaction, onClose]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'Enter' && selectedIndex !== null) {
                const transactionToLoad = transactions[selectedIndex];
                if (transactionToLoad) {
                    onLoadTransaction(transactionToLoad.id);
                    setSelectedIndex(null);
                    onClose();
                }
            } else if (event.key === 'ArrowDown') {
                setSelectedIndex(prevIndex => (prevIndex === null ? 0 : Math.min(prevIndex + 1, transactions.length - 1)));
            } else if (event.key === 'ArrowUp') {
                setSelectedIndex(prevIndex => (prevIndex === null ? 0 : Math.max(prevIndex - 1, 0)));
            } else if (event.ctrlKey && event.key === 'F12') {
                event.preventDefault();
                onClose(); // You can implement modal open logic here
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [transactions, selectedIndex, onClose, onLoadTransaction]);

    useEffect(() => {
        if (focused && transactionsRef.current[selectedIndex]) {
            transactionsRef.current[selectedIndex].focus();
        }
    }, [focused, selectedIndex]);

    return (
        isVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Saved Transactions</h2>
                        <button onClick={onClose} className="text-red-500 font-bold">Close</button>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">Transactions List</h3>
                        <div className="overflow-y-auto max-h-96">
                            {transactions.length === 0 ? (
                                <p>No transactions found.</p>
                            ) : (
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">ID</th>
                                            <th className="py-2 px-4 border-b">User</th>
                                            <th className="py-2 px-4 border-b">Date/Time</th>
                                            <th className="py-2 px-4 border-b">Items</th>
                                            <th className="py-2 px-4 border-b">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction, index) => (
                                            <tr
                                                key={index}
                                                ref={el => transactionsRef.current[index] = el}
                                                className={`cursor-pointer ${index === selectedIndex ? 'bg-gray-200' : ''}`}
                                                onClick={() => {
                                                    setSelectedIndex(index);
                                                    setFocused(true);
                                                }}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                            >
                                                <td className="py-2 px-4 border-b">{transaction.id}</td>
                                                <td className="py-2 px-4 border-b">{transaction.username}</td>
                                                <td className="py-2 px-4 border-b">{transaction.dateTime}</td>
                                                <td className="py-2 px-4 border-b">
                                                    <div className="overflow-y-auto max-h-40">
                                                        <table className="w-full border-collapse">
                                                            <tbody>
                                                                {transaction.items.map((item, itemIndex) => (
                                                                    <tr key={itemIndex}>
                                                                        <td className="border-b px-2 py-1">{item.product}</td>
                                                                        <td className="border-b px-2 py-1">{item.quantity}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 border-b">${transaction.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default TransactionsModal;
