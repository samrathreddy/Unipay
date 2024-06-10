require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const limiter = require('./Middlewares/rateLimitMiddleware');
const rollRoutes = require('./routes/rollRoute');
const dobRoutes = require('./Routes/dobRoute');
const feeRoutes = require('./Routes/feeRoute');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Handle preflight requests
app.options('*', cors(corsOptions)); // Preflight requests are always OPTIONS

// Apply CORS and JSON body parser middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);

connectDB();

app.use('/v1/api/roll', rollRoutes);
app.use('/v1/api/dob', dobRoutes);
app.use('/v1/api/fee/', feeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
