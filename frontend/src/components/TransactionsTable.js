import React, { useState, useEffect } from 'react';
import './TransactionsTable.css';

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('3'); // Default month is March
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (selectedMonth) {
      fetchTransactions(selectedMonth, currentPage);
    }
  }, [selectedMonth, currentPage]);

  const fetchTransactions = async (month, page) => {
    try {
      let apiUrl = `http://localhost:3000/api/transactions-by-month?month=${month}&page=${page}&limit=10`;
      if (searchText) {
        apiUrl = `http://localhost:3000/api/searchTransactionsByMonth?month=${month}&searchText=${searchText}`;
      }
      console.log('API URL:', apiUrl); // Log the constructed API URL
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const { transactions, totalPages } = await response.json();
      console.log('Transactions:', transactions); // Log the fetched transactions
      setTransactions(transactions);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1); // Reset to first page when month changes
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when performing a new search
    fetchTransactions(selectedMonth, 1);
  };

  return (
    <div className="container">
      <label htmlFor="month">Transaction Dashboard -</label>
      <select id="month" value={selectedMonth} onChange={handleMonthChange}>
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

      <br></br>
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={handleSearchTextChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSearch}>Search</button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Images</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.id}</td>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>${transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
              <td>
                {transaction.images && transaction.images.map((image, index) => (
                  <img key={index} src={image} alt={`${index}`} style={{ width: '100px', height: '100px' }} />
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <div className="page-info">
          Page {currentPage} of {totalPages}
        </div>
        <div className="page-actions">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
        <div className="per-page">
          Per Page: 10
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
