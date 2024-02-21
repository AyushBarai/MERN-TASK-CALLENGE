const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/transactions', transactionController.getAllTransactions);
router.get('/statistics', transactionController.getStatistics);
router.get('/bar-chart', transactionController.getBarChartData);
router.get('/pie-chart', transactionController.getPieChartData);
router.get('/combined', transactionController.combineData);
router.get('/transactions-by-month', transactionController.getTransactionsByMonth);
router.get('/searchTransactionsByMonth', transactionController.searchTransactionsByMonth);

module.exports = router;
