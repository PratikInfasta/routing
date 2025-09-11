const mongoose = require('mongoose');




const ConnectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('✅ database connect successful in mongodb');

    } catch(error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // stop the app if db is not conne
    }

}

module.exports = ConnectDb;





