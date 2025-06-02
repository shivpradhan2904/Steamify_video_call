const Usermodel = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { upsertStreamUser } = require("../lib/stream");

module.exports.signup = async (req, res) => {
  const { fullname, email, password } = req.body;
    // console.log("Received signup data:", req.body); // 👈 yaha likho

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const existUser = await Usermodel.findOne({ email: email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; //generat a number between 1 and 100 for profile picture in the api there was 100 profile
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`; //random avatar from the api

    //creating account
    const newUser = await Usermodel.create({
      fullname,
      email,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id,
        name: newUser.fullname,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created/updated: ${newUser.fullname}`);
    } catch (error) {}

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7h",
    });
    res.cookie("token", token, {
      httpOnly: true, //prevents XSS attacks
      sameSite: "Strict", //prevents CSRF attacks
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

module.exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    Usermodel.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7h",
        });
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "Strict",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
          message: "User logged in successfully",
          user,
        });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ message: "Error logging in user", error: err.message });
      });
  } catch (error) {}
};

module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
};

module.exports.onboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullname, bio, nativelanguage, learninglanguage, location } =
      req.body;
    if (
      !fullname ||
      !bio ||
      !nativelanguage ||
      !learninglanguage ||
      !location
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
      missingFields = [
        !fullname ? "fullname" : "",
        !bio ? "bio" : "",
        !nativelanguage ? "nativelanguage" : "",
        !learninglanguage ? "learninglanguage" : "",
        !location ? "location" : "",
      ];
    }
    const updatedUser = await Usermodel.findByIdAndUpdate(
      userId,
      {
        ...req.body, // 👈 This includes profilePic (and anything else sent)
        isOnboarded: true,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User onboarded successfully",
      user: updatedUser,
    });

    //TODO Update the user info in Stream
    try {
      await upsertStreamUser({
        id: updatedUser._id,
        name: updatedUser.fullname,
        image: updatedUser.profilePic || "",
      });
      console.log("Stream user updated:", updatedUser.fullname);
    } catch (error) {
      console.log("Error updating Stream user:", error.message);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};
