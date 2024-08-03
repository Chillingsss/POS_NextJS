"use client";

import React, { useState, useEffect } from 'react';

const ReportsUserModal = ({ isVisible, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const username = localStorage.getItem('currentUsername');
    const [filterName, setFilterName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (isVisible) {
            const paidTransactions = JSON.parse(localStorage.getItem('paidTransactions')) || [];
            const userTransactions = paidTransactions.filter(transaction => transaction.username === username);
            setTransactions(userTransactions);
        }
    }, [isVisible, username]);

    const parseDate = (dateString) => {
        return new Date(dateString);
    };

    const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = parseDate(transaction.dateTime);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null;

        return (
            (!filterName || transaction.fullName === filterName) &&
            (!start || transactionDate >= start) &&
            (!end || transactionDate <= end)
        );
    });

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

        const printWindow = window.open('', '', 'height=600,width=800');
        const printContent = contentElement.innerHTML;
        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .report-container { margin-bottom: 20px; }
                        .report-item { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
                        .report-item p { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    ${printContent}
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
                    <div id="userTransactions" className="overflow-y-auto max-h-96">
                        {filteredTransactions.length === 0 ? (
                            <p>No transactions found.</p>
                        ) : (
                            filteredTransactions.map((transaction, index) => (
                                <div key={index} className="border p-4 rounded report-item">
                                    <p><strong>User:</strong> {transaction.fullName} ({transaction.username})</p>
                                    <p><strong>Date/Time:</strong> {transaction.dateTime}</p>
                                    <p><strong>Total:</strong> ${transaction.total.toFixed(2)}</p>
                                    <p><strong>Cash Tendered:</strong> ${transaction.cashTendered.toFixed(2)}</p>
                                    <p><strong>Change:</strong> ${transaction.change.toFixed(2)}</p>
                                    <div>
                                        <strong>Items:</strong>
                                        <ul className="list-disc pl-5">
                                            {transaction.items.map((item, idx) => (
                                                <li key={idx}>{item.quantity} x {item.product} - ${item.amount.toFixed(2)}</li>
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
