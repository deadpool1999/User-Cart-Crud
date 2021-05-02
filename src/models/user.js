const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Item = require("./item");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 6,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Choose a strong password");
        }
      },
    },
    //storing array of tokens, allowing multiple connections.
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],

    //storing array of cart items object id.
    cart: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectID,
          ref: "Item",
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

//method for instance of User
//INSTANCE METHODS
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  //on login requrest, token will be generated and
  //saved in the database.
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//Special function, which is called automatically,
//we don't need to call it, it modifies our user json, that is
//sent by removing the password and tokens array from it.
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  //not included in final json received on client.
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

//method that will be available to be accessed on model.
//MODEL METHODS
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login..");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login..");
  }

  return user;
};

//HASHING
//middleware which runs before save().
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Delete User Tasks when user is removed:
userSchema.pre("remove", async function (next) {
  const user = this;
  await Item.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// toJSON: When we call res.send(), JSON.stringify method get's called
// on the user, we have set up toJSON method on the user to manipulate
// it.
