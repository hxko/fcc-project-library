const mongoose = require('mongoose');

const uri = process.env.DB;

mongoose.connect(uri);
const db = mongoose.connection;

db.on('connected', () => console.log('MongoDB connected'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('disconnected', () => console.log('MongoDB disconnected'));

module.exports = db;