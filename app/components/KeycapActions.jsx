"use client";

import React, { useEffect, useRef } from 'react';

const KeycapActions = ({
    handleVoidItems,
    handleSaveTransaction,
    handlePaidTransaction,
    handleLoadTransaction,
    items,
    handleLogout,
    setSelectedTransactionIndex,
    selectedTransactionIndex,
    setShowReportsModal,
    isAdmin,
    toggleCashInputVisibility
}) => {

    const quantityRef = useRef(null);
    useEffect(() => {
        const handleKeyDown = (event) => {
            // if (event.ctrlKey && event.key === '1') {
            //     event.preventDefault();
            //     console.log('Ctrl + 1 detected');
            //     if (quantityRef.current) {
            //         quantityRef.current.focus();
            //     } else {
            //         console.error('quantityRef.current is null');
            //     }
            //     return;
            // }


            if (event.ctrlKey && event.key === 'F1') {
                event.preventDefault();
                toggleCashInputVisibility();
                return;
            }

            if (event.ctrlKey && event.key === 'F11') {
                event.preventDefault();
                handleSaveTransaction();
                return;
            }

            if (event.ctrlKey && event.key === 'F2') {
                event.preventDefault();
                handlePaidTransaction();
                return;
            }

            if (event.ctrlKey && event.key === 'F8') {
                event.preventDefault();
                if (isAdmin) {
                    setShowReportsModal(true);
                } else {
                    alert('Only admins can view the reports.');
                }

                return;
            }


            switch (event.key) {
                // case 'V':
                //     if (items.length > 0) {
                //         handleVoidItems(items, true);
                //     }
                //     break;

                // case 'ArrowLeft':
                //     handlePaidTransaction();
                //     break;

                // case '`':
                //     const transactions = JSON.parse(localStorage.getItem('savedTransactions')) || [];
                //     if (transactions.length > 0) {
                //         setSelectedTransactionIndex(prevIndex => {
                //             const nextIndex = (prevIndex === null || prevIndex === transactions.length - 1) ? 0 : prevIndex + 1;
                //             return nextIndex;
                //         });
                //     }
                //     break;
                // case '0':
                //     if (selectedTransactionIndex !== null) {
                //         handleLoadTransaction(selectedTransactionIndex);
                //     }
                //     break;

                case 'L':
                    handleLogout();
                    break;
                case 'R':
                    if (isAdmin) {
                        setShowReportsModal(true);
                    } else {
                        alert('Only admins can view the reports.');
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleVoidItems, handleSaveTransaction, handlePaidTransaction, handleLoadTransaction, items, handleLogout, selectedTransactionIndex, setSelectedTransactionIndex, setShowReportsModal, isAdmin, toggleCashInputVisibility]);

    return null;
};

export default KeycapActions;
