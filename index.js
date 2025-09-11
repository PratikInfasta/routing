require('dotenv').config()
const express = require('express');
const port = process.env.PORT || 7000;
const app = express();
const aboutRouter = require('./routes/about');
const contactRouter = require('./routes/contact');
const ConnectDb = require('./config/db')
const bodyParser = require("body-parser");
const authen = require('./model/authUser')
app.set('view engine', 'ejs');
app.use(express.static('public'));

// middle ware 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// database connection here 
ConnectDb()

// render the html 
app.get('/', (req, resp) => {
  resp.send(`
    <form action="/submit" method="POST">
      <input type="text" name="username" placeholder="Enter Name"  />
      <input type="email" name="useremail" placeholder="Enter Email"  />
      <input type="password" name="userpassword" placeholder="Enter Password"  />
      <button type="submit">Submit</button>
    </form>
  `);
});


// POST users (create user) here 
app.post("/submit", async (req, res) => {
  try {
    const { username, useremail, userpassword } = req.body;
    const newUser = new authen({ username, useremail, userpassword });

    await newUser.save();
    // ✅ Success response with status code 201
    res.status(200).json({
      success: true,
      message: "Form Data Saved in MongoDB!",
      data: newUser
    })
  } catch (error) {
    // ❌ Error response with status code 500
    res.status(500).json({
       success: false,
      message: "Error saving data",
      error: error.message
    })
  }
});



// GET(see all users) users is router 
app.get("/users", async (req, res) => {
  const users = await authen.find();
  res.json(users);
});


// DELETE user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // const deletedUser = await authen.findByIdAndDelete(id);
    const deletedUser = await authen.findOneAndDelete({ userId: Number(id) });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", users: deletedUser });
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