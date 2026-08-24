require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loginRoutes = require('./routes/login');
const companyRoutes = require('./routes/company');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const partiesRoutes = require('./routes/parties');
const transactionsRoutes = require('./routes/transactions');
const productsRoutes = require('./routes/products');
const paymentsRoutes = require('./routes/payments');
const reportsRoutes = require('./routes/reports');

const app = express();
const port = process.env.PORT || 1500;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/parties', partiesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/bank_accounts', require('./routes/bank_accounts'));
app.use('/api/signatures', require('./routes/signatures'));
app.use('/api/settings', require('./routes/settings'));

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
