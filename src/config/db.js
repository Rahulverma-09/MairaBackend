const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://errahulverma:NBscZYSOYG1P07qZ@vmax-cluster09.tqrpt4d.mongodb.net/mairajewels?retryWrites=true&w=majority';
        const conn = await mongoose.connect(uri);
        console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`[Database] Connection Error: ${error.message}`);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
