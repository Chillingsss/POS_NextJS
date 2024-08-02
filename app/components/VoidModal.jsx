import React, { useState, useEffect, useRef } from 'react';

const VoidModal = ({ isVisible, onClose, items, onVoidItem, quantityRef }) => {
    const [inputId, setInputId] = useState('');
    const adminPasswordRef = useRef(null);


    const handleItemIdChange = (e) => {
        setInputId(e.target.value);
        const item = items.find(item => item.id === parseInt(e.target.value));
        if (item) {
            onVoidItem(item);
            setInputId('');
            onClose();
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();


            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, quantityRef]);

    return (
        isVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Void Item</h2>
                        <button onClick={onClose} className="text-red-500 font-bold">Close</button>
                    </div>
                    <div className="mb-4 space-y-4">
                        <input
                            type="number"
                            placeholder="Enter Item ID to Void"
                            value={inputId}
                            onChange={handleItemIdChange}
                            className="border border-gray-300 rounded p-2 w-full"
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">Current Sale Items</h3>
                        <div className="overflow-y-auto max-h-96">
                            {items.length === 0 ? (
                                <p>No items found.</p>
                            ) : (
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">ID</th>
                                            <th className="py-2 px-4 border-b">Product</th>
                                            <th className="py-2 px-4 border-b">Quantity</th>
                                            <th className="py-2 px-4 border-b">Price</th>
                                            <th className="py-2 px-4 border-b">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-2 px-4 border-b">{index + 1}</td>
                                                <td className="py-2 px-4 border-b">{item.product}</td>
                                                <td className="py-2 px-4 border-b">{item.quantity}</td>
                                                <td className="py-2 px-4 border-b">${item.price.toFixed(2)}</td>
                                                <td className="py-2 px-4 border-b">${item.amount.toFixed(2)}</td>
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

export default VoidModal;
