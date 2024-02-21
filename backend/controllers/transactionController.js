const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize database with seed data
async function initializeDatabase() {
  try {
    // Fetch data from the third-party API
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data; // Retrieved data from the API

    // Insert fetched data into the database
    await Transaction.insertMany(transactions);
    console.log('Database initialized with seed data.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Get all transactions with search and pagination support
async function getAllTransactions(req, res) {
  try {
    const { page = 1, perPage = 10, search = '' } = req.query;
    const regex = new RegExp(search, 'i');
    let query = {
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ]
    };

    // Handle search for price separately if it's a valid number
    const parsedPrice = parseFloat(search);
    if (!isNaN(parsedPrice)) {
      query.$or.push({ price: parsedPrice });
    }

    // Count total matching documents for pagination
    const totalCount = await Transaction.countDocuments(query);

    // Find matching documents with pagination
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({
      transactions,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage: parseInt(page),
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get statistics
async function getStatistics(req, res) {
  try {
    const { month } = req.query;
    const monthInt = parseInt(month);
    
    // Check if the provided month is a valid number between 1 and 12
    if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ message: 'Invalid month. Expected value is any month between January (1) to December (12).' });
    }
    
    // Aggregate to calculate total sale amount and count of sold items for the selected month
    const statistics = await Transaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthInt] }
        }
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: '$price' },
          totalSoldItems: { $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] } }
        }
      }
    ]);

    // If no data is found for the selected month, return empty statistics
    if (statistics.length === 0) {
      return res.json({ totalSaleAmount: 0, totalSoldItems: 0 });
    }

    // Extract the first element of the result array since we're using $group
    const { totalSaleAmount, totalSoldItems } = statistics[0];
    
    // Count total number of not sold items for the selected month
    const totalNotSoldItems = await Transaction.countDocuments({
      $expr: { $and: [{ $eq: [{ $month: '$dateOfSale' }, monthInt] }, { $eq: ['$sold', false] }] }
    });

    res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// Get bar chart data for the selected month
async function getBarChartData(req, res) {
  try {
    const { month } = req.query;
    const parsedMonth = parseInt(month);
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: "Invalid month. Please provide a valid month between 1 and 12." });
    }

    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity }
    ];

    const barChartData = [];

    for (const range of priceRanges) {
      const count = await Transaction.aggregate([
        {
          $match: {
            price: { $gte: range.min, $lte: range.max }
          }
        },
        {
          $project: {
            month: { $month: "$dateOfSale" }
          }
        },
        {
          $match: {
            month: parsedMonth
          }
        },
        {
          $count: "count"
        }
      ]);

      barChartData.push({ range: `${range.min}-${range.max}`, count: count.length > 0 ? count[0].count : 0 });
    }

    res.json(barChartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



// Get pie chart data for the selected month
async function getPieChartData(req, res) {
  try {
    const { month } = req.query;
    const parsedMonth = parseInt(month);
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: "Invalid month. Please provide a valid month between 1 and 12." });
    }

    const pieChartData = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, parsedMonth]
          }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(pieChartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// Combine data from all APIs
async function combineData(req, res) {
  try {
    const { month } = req.query;
    const statisticsPromise = axios.get(`http://localhost:3000/api/statistics?month=${month}`);
    const barChartDataPromise = axios.get(`http://localhost:3000/api/bar-chart?month=${month}`);
    const pieChartDataPromise = axios.get(`http://localhost:3000/api/pie-chart?month=${month}`);

    // Wait for all API requests to complete
    const [statisticsResponse, barChartDataResponse, pieChartDataResponse] = await Promise.all([
      statisticsPromise,
      barChartDataPromise,
      pieChartDataPromise
    ]);

    // Combine responses
    const combinedData = {
      statistics: statisticsResponse.data,
      barChartData: barChartDataResponse.data,
      pieChartData: pieChartDataResponse.data
    };

    res.json(combinedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get transactions by month with pagination, per-page limit, and total pages
async function getTransactionsByMonth(req, res) {
  try {
    const { month, page = 1, limit = 10 } = req.query;
    const parsedMonth = parseInt(month);
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: "Invalid month. Please provide a valid month between 1 and 12." });
    }

    const totalCount = await Transaction.countDocuments({
      $expr: { $eq: [{ $month: '$dateOfSale' }, parsedMonth] }
    });

    const totalPages = Math.ceil(totalCount / parsedLimit);

    const transactions = await Transaction.find({
      $expr: { $eq: [{ $month: '$dateOfSale' }, parsedMonth] }
    }).select('id title description price category sold images')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      transactions,
      totalPages // Including totalPages in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}









// Get transactions by month with pagination, per-page limit, total pages, and search text option
async function searchTransactionsByMonth(req, res) {
  try {
    const { month, page = 1, limit = 10, searchText } = req.query;
    const parsedMonth = parseInt(month);
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: "Invalid month. Please provide a valid month between 1 and 12." });
    }

    let query = {
      $expr: { $eq: [{ $month: '$dateOfSale' }, parsedMonth] }
    };

    // If search text is provided, include it in the query
    if (searchText) {
      const regex = new RegExp(searchText, 'i');
      query.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ];
    }

    // Get the distinct IDs and titles of transactions matching the query
    const distinctIds = await Transaction.distinct('id', query);
    const distinctTitles = await Transaction.distinct('title', query);

    // Combine IDs and titles into a single array of objects
    const distinctTransactions = distinctIds.map((id, index) => ({ id, title: distinctTitles[index] }));

    const totalCount = distinctTransactions.length;

    // Calculate the total number of pages based on the total count and limit per page
    const totalPages = Math.ceil(totalCount / parsedLimit);

    // Retrieve transactions for the requested page
    const transactions = await Transaction.find(query)
      .select('id title description price category sold images')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    // Filter out duplicate transactions based on ID to ensure uniqueness
    const uniqueTransactions = [];
    const idSet = new Set(); // Use a Set to keep track of unique IDs

    transactions.forEach(transaction => {
      if (!idSet.has(transaction.id)) {
        uniqueTransactions.push(transaction);
        idSet.add(transaction.id);
      }
    });

    res.json({
      transactions: uniqueTransactions,
      totalPages // Including totalPages in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}









module.exports = {
  initializeDatabase,
  getAllTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
  combineData,
  getTransactionsByMonth,
  searchTransactionsByMonth
};
