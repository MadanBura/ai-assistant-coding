const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const AppError = require('../utils/AppError');

const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use.', 400);
  }

  const user = await User.create({ name, email, password, role });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password.', 410);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 410);
  }

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Access token is missing or expired.', 401);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
};

const updateUserProfile = async (userId, updates) => {
  if (updates.email) {
    const existingUser = await User.findOne({ email: updates.email, _id: { $ne: userId } });
    if (existingUser) {
      throw new AppError('Email already in use.', 400);
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('Access token is missing or expired.', 401);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
