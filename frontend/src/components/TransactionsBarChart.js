import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './TransactionsBarChart.css'; // Import CSS file

const TransactionsBarChart = () => {
    const [selectedMonth, setSelectedMonth] = useState('6');
    let chartInstance = null;

    useEffect(() => {
        const fetchChartData = async (month) => {
            try {
                const response = await axios.get(`http://localhost:3000/api/bar-chart?month=${month}`);
                drawChart(response.data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };
    
        fetchChartData(selectedMonth);
    
        // Cleanup function to destroy the chart instance
        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
        
    }, [selectedMonth]);
    

    const drawChart = (data) => {
        const labels = [];
        const counts = [];

        // Extract labels and counts from data
        data.forEach(item => {
            const [min, max] = item.range.split('-');
            labels.push(`${min}-${max}`);
            counts.push(item.count);
        });

        const ctx = document.getElementById('transactionsChart');

        // Destroy the previous chart instance if it exists
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Items',
                    data: counts,
                    backgroundColor: 'rgb(0, 255, 255)',
                    borderColor: 'rgb(0, 255, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    return (
        <div className="transactions-bar-chart-container">
                <label htmlFor="month">Bar Chart Stats -</label>
                <select id="month" value={selectedMonth} onChange={handleMonthChange}>
                    {[...Array(12)].map((_, index) => (
                        <option key={index + 1} value={String(index + 1)}>{new Date(2022, index).toLocaleDateString('en-US', { month: 'long' })}</option>
                    ))}
                </select>
                <span>(Select Month)</span>
            <canvas id="transactionsChart"></canvas>
        </div>
    );
};

export default TransactionsBarChart;
