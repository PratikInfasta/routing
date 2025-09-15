require('dotenv').config()
const express = require('express');
const port = process.env.PORT || 7000;
const app = express();
const aboutRouter = require('./routes/about');
const contactRouter = require('./routes/contact');
const ConnectDb = require('./config/db')
const bodyParser = require("body-parser");
const authen = require('./model/authUser')
const OtpToken = require('./model/otpToken')
const bcrypt = require('bcrypt');
app.set('view engine', 'ejs');
app.use(express.static('public'));
const nodemailer = require("nodemailer");
// middle ware 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// database connection here 
ConnectDb()

// render the html 
// app.get('/', (req, resp) => {
//   resp.send(`
//     <form action="/submit" method="POST">
//       <input type="text" name="username" placeholder="Enter Name"  />
//       <input type="email" name="useremail" placeholder="Enter Email"  />
//       <input type="password" name="userpassword" placeholder="Enter Password"  />
//       <button type="submit">Submit</button>
//     </form>
//   `);
// });


// Store OTPs temporarily in memory
const otpStore = {}; // { email: otp }

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,          // 465 for SSL, 587 for TLS
  secure: true,       // true for 465, false for 587
  auth: {
    user: "YOUR_APP_EMAL",
    pass: "YOUR_APP_PASSWORD",
  },
  tls: {
    rejectUnauthorized: false, // accept self-signed certs
  },
});

// --- Function to send OTP ---
const sendOTP = async (toEmail, otp) => {
  const mailOptions = {
    from: "pratik.infasta@gmail.com",
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to email successfully");
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

// --- Home page (Email form) ---
app.get("/otp", (req, res) => {
  res.send(`
    <h2>Send OTP</h2>
    <form action="/send-otp" method="POST">
      <input type="email" name="email" placeholder="Enter your email" required/>
      <button type="submit">Send OTP</button>
    </form>
  `);
});

// --- Send OTP route ---
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpHash = await bcrypt.hash(otp, 10);

  // Save OTP in DB with 10-min expiration
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpToken.create({ email, otpHash, expiresAt });

  await sendOTP(email, otp);

  res.send(`
    <h3>OTP sent to ${email}</h3>
    <form action="/verify-otp" method="POST">
      <input type="hidden" name="email" value="${email}">
      <input type="text" name="otp" placeholder="Enter OTP" required>
      <button type="submit">Verify OTP</button>
    </form>
  `);
});

// --- Verify OTP route ---
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const token = await OtpToken.findOne({ email }).sort({ createdAt: -1 });

  if (!token) return res.send(`<h3>❌ OTP expired or not found.</h3>`);

  const isValid = await bcrypt.compare(otp, token.otpHash);

  if (isValid) {
    await OtpToken.deleteMany({ email }); // Remove OTPs after verification
    res.send(`<h3>✅ OTP verified successfully!</h3>`);
  } else {
    res.send(`<h3>❌ Invalid OTP. Try again.</h3>`);
  }
});












// POST users (create user) here 
// app.post("/submit", async (req, res) => {
//   try {
//     const { username, useremail, userpassword } = req.body;
//     const newUser = new authen({ username, useremail, userpassword });

//     await newUser.save();
//     // ✅ Success response with status code 201
//     res.status(200).json({
//       success: true,
//       message: "Form Data Saved in MongoDB!",
//       data: newUser
//     })
//   } catch (error) {
//     // ❌ Error response with status code 500
//     res.status(500).json({
//        success: false,
//       message: "Error saving data",
//       error: error.message
//     })
//   }
// });



// GET(see all users) users is router 
// app.get("/users", async (req, res) => {
//   const users = await authen.find();
//   res.json(users);
// });


// DELETE user by ID
// app.delete("/users/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     // const deletedUser = await authen.findByIdAndDelete(id);
//     const deletedUser = await authen.findOneAndDelete({ userId: Number(id) });

//     if (!deletedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "User deleted successfully", users: deletedUser });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting user", error });
//   }
// });


// router part 
// app.use('/api/about', aboutRouter);
// app.use('/api/contact', contactRouter);


app.listen(port, () => {
  console.log(`server start ${port} number`);
})