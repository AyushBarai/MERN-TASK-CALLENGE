import React from 'react';
import './App.css'
import TransactionsTable from './components/TransactionsTable';
import TransactionsStatistics from './components/TransactionsStatistics';
import TransactionsBarChart from './components/TransactionsBarChart';

function App() {
  return (
    <div className="App">
      <TransactionsTable />
      <TransactionsStatistics />
      <TransactionsBarChart />
    </div>
  );
}

export default App;
