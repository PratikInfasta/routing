const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    useremail: {
      type: String,
      unique: true,
      required: true,
    },
    userpassword: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔢 Add auto-increment plugin
UserSchema.plugin(AutoIncrement, { inc_field: "userId" });
// 👉 "userId" will be an auto-increment field (1, 2, 3...)

module.exports = mongoose.model("authentication", UserSchema);
