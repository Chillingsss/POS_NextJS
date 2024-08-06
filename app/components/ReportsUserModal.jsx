"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsUserModal = ({ isVisible, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const username = localStorage.getItem('currentUsername');
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        if (isVisible) {
            setError(null);
            fetchShiftReport(userId);
        }
    }, [isVisible, userId]);

    const fetchShiftReport = async (userId) => {
        try {
            setLoading(true);

            const response = await axios.post('http://localhost/pos/sales.php', new URLSearchParams({
                operation: 'getShiftReport',
                json: JSON.stringify({ userId })
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;
            if (Array.isArray(data)) {
                setTransactions(data.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date)));
            } else {
                setError('Error fetching transactions');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const parseDate = (dateString) => {

        const parsedDate = new Date(Date.parse(dateString));
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };


    const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = parseDate(transaction.sale_date);
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;

        console.log(`Transaction Date: ${transactionDate}`);
        console.log(`Start Date: ${start}`);
        console.log(`End Date: ${end}`);

        return (
            (!filterName || transaction.user_username === filterName) &&
            (!start || transactionDate >= start) &&
            (!end || transactionDate <= end)
        );
    });


    const getTotalForDateRange = (transactions) => {
        return transactions.reduce((total, transaction) => total + transaction.sale_totalAmount, 0);
    };

    const getTodayTotal = () => {
        const today = new Date();
        const startOfToday = new Date(today.toDateString());
        const endOfToday = new Date(today.toDateString());
        endOfToday.setHours(23, 59, 59, 999);

        console.log("Start of Today:", startOfToday);
        console.log("End of Today:", endOfToday);

        const todayTransactions = transactions.filter(transaction => {
            const transactionDate = parseDate(transaction.sale_date);
            console.log(`Transaction Date: ${transactionDate}, Transaction Sale Date: ${transaction.sale_date}`);
            return transactionDate >= startOfToday && transactionDate <= endOfToday;
        });

        console.log("Today's Transactions:", todayTransactions);

        return getTotalForDateRange(todayTransactions);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
            if (event.ctrlKey && event.key === 'F10') {
                printContent('userTransactions');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const printContent = (contentId) => {
        const contentElement = document.getElementById(contentId);
        if (!contentElement) {
            console.error(`Element with ID ${contentId} not found.`);
            return;
        }

        // Improved date parsing
        const parseDate = (dateString) => {
            const parsedDate = new Date(dateString);
            if (isNaN(parsedDate.getTime())) {
                console.error(`Invalid date: ${dateString}`);
                return null;
            }
            return parsedDate;
        };

        // Move filteredTransactions calculation inside printContent
        const filteredTransactions = transactions.filter(transaction => {
            const transactionDate = parseDate(transaction.sale_date);
            const start = startDate ? new Date(startDate + 'T00:00:00') : null;
            const end = endDate ? new Date(endDate + 'T23:59:59') : null;

            console.log(`Transaction Date: ${transactionDate}`);
            console.log(`Start Date: ${start}`);
            console.log(`End Date: ${end}`);

            return (
                (!filterName || transaction.user_username === filterName) &&
                (!start || transactionDate >= start) &&
                (!end || transactionDate <= end)
            );
        });

        console.log("Filtered Transactions:", filteredTransactions);

        const getTotalForDateRange = (transactions) => {
            return transactions.reduce((total, transaction) => total + transaction.sale_totalAmount, 0);
        };

        const getTodayTotal = () => {
            const today = new Date();
            const startOfToday = new Date(today.toDateString());
            const endOfToday = new Date(today.toDateString());
            endOfToday.setHours(23, 59, 59, 999);

            console.log("Start of Today:", startOfToday);
            console.log("End of Today:", endOfToday);

            // Use filteredTransactions for final filtering
            const todayTransactions = filteredTransactions.filter(transaction => {
                const transactionDate = parseDate(transaction.sale_date);
                console.log(`Transaction Date: ${transactionDate}`);
                return transactionDate >= startOfToday && transactionDate <= endOfToday;
            });

            console.log("Today's Transactions:", todayTransactions);

            return getTotalForDateRange(todayTransactions);
        };

        const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const printWindow = window.open('', '', 'height=600,width=300');
        const contentHtml = contentElement.innerHTML;

        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Report</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                            margin: 0;
                            padding: 0;
                        }
                        .receipt-container {
                            width: 300px;
                            margin: 0 auto;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }
                        .receipt-header, .receipt-footer {
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        .receipt-header h2 {
                            margin: 0;
                            font-size: 14px;
                            font-weight: bold;
                        }
                        .receipt-header p {
                            margin: 5px 0;
                        }
                        .receipt-item {
                            border-bottom: 1px solid #ddd;
                            padding: 5px 0;
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 5px;
                        }
                        .receipt-item:last-child {
                            border-bottom: none;
                        }
                        .receipt-total {
                            font-size: 14px;
                            font-weight: bold;
                            margin-top: 10px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="receipt-header">
                            <h2>Print Report</h2>
                            <p>Date: ${printDate}</p>
                        </div>
                        ${contentHtml}
                        <div class="receipt-total">
                            <h3 class="text-xl font-bold">Total of Today's Transactions: ₱${getTodayTotal().toFixed(2)}</h3>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };






    return (
        isVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">User Transaction Reports</h2>
                        <button onClick={onClose} className="text-red-500 font-bold">Close</button>
                    </div>
                    <div className="mb-4 space-y-4">
                        <input
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
                        />
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold">Total of Today's Transactions: ₱{getTodayTotal().toFixed(2)}</h3>
                        <h3 className="text-xl font-bold">Total for Selected Date Range: ₱{getTotalForDateRange(filteredTransactions).toFixed(2)}</h3>
                    </div>
                    <div id="userTransactions" className="overflow-y-auto max-h-96">
                        {filteredTransactions.length === 0 ? (
                            <p>No transactions found.</p>
                        ) : (
                            filteredTransactions.map((transaction, index) => (
                                <div key={index} className="border p-4 rounded report-item">
                                    <p><strong>User:</strong> {transaction.user_username}</p>
                                    <p><strong>Date/Time:</strong> {transaction.sale_date}</p>
                                    <p><strong>Total:</strong> ₱{transaction.sale_totalAmount.toFixed(2)}</p>
                                    <p><strong>Cash Tendered:</strong> ₱{transaction.sale_cashTendered.toFixed(2)}</p>
                                    <p><strong>Change:</strong> ₱{transaction.sale_change.toFixed(2)}</p>
                                    <div>
                                        <strong>Items:</strong>
                                        <ul className="list-disc pl-5">
                                            {transaction.items.map((item, idx) => (
                                                <li key={idx}>{item.product_name} - {item.quantity}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )
    );
};

export default ReportsUserModal;
