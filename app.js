require('dotenv').config()
const express = require('express');
const port = process.env.PORT || 7000;
const app = express();
const aboutRouter = require('./routes/about');
const contactRouter = require('./routes/contact');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.set('view engine', 'ejs');
app.use(express.static('public'));

// middle ware 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// database connection here 
// const MongoUri = 'mongodb+srv://pratik_db_user:pratik_db_user@testing.umckrwv.mongodb.net/test';

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error("❌ MongoDB connection error:", err));


// mongoose.Schema write here 
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// create mongoose.Collection here 
const modal = mongoose.model('login', userSchema);


app.get('/about', (req, resp) => {
  resp.send(`
    <form action="/submit" method="POST">
      <input type="text" name="name" placeholder="Enter Name" required />
      <input type="email" name="email" placeholder="Enter Email" required />
      <input type="password" name="password" placeholder="Enter Password" required />
      <button type="submit">Submit</button>
    </form>
  `);
});


// POST users (create user) here 
app.post("/submit", async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new modal({ name, email, password });

  await newUser.save();
  res.send("Form Data Saved in MongoDB!");
});



// GET(see all users) users is router 
app.get("/users", async (req, res) => {
  const users = await modal.find();
  res.json(users);
});


// DELETE user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await modal.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", users: deletedUser });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});


// router part 
app.use('/api/about', aboutRouter);
app.use('/api/contact', contactRouter);


app.listen(port, () => {
  console.log(`server start ${port} number`);
})