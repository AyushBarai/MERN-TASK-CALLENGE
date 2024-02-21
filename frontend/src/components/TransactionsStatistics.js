import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionsStatistics.css'; // Import CSS file for styles

const TransactionsStatistics = () => {
    const [totalSaleAmount, setTotalSaleAmount] = useState(0);
    const [totalSoldItems, setTotalSoldItems] = useState(0);
    const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState('6');

    useEffect(() => {
        // Fetch statistics for the selected month
        fetchStatistics(selectedMonth);
    }, [selectedMonth]);

    const fetchStatistics = async (month) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/statistics?month=${month}`);
            const { totalSaleAmount, totalSoldItems, totalNotSoldItems } = response.data;
            setTotalSaleAmount(totalSaleAmount);
            setTotalSoldItems(totalSoldItems);
            setTotalNotSoldItems(totalNotSoldItems);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    return (
        <div className="transactions-statistics-container">
            <label>Transactions Statistics -</label>
                <select value={selectedMonth} onChange={handleMonthChange}>
                    {/* Options for months */}
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
                <span>(Select Month)</span>
            <div className="statistics-table">
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Amount of Sale</td>
                            <td>{totalSaleAmount}</td>
                        </tr>
                        <tr>
                            <td>Total Sold Items</td>
                            <td>{totalSoldItems}</td>
                        </tr>
                        <tr>
                            <td>Total Not Sold Items</td>
                            <td>{totalNotSoldItems}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsStatistics;
