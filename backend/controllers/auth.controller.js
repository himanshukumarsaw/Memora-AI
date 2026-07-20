const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.model');

const generateToken = (userId) => jwt.sign(
  { userId },
  process.env.JWT_SECRET || 'memora_secret',
  { expiresIn: '7d' }
);

// POST /api/auth/register
const register = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

      const user = await User.create({ name, email, password });
      const token = generateToken(user._id);
      res.status(201).json({ success: true, message: 'Account created!', token, user: user.toJSON() });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
];

// POST /api/auth/login
const login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const token = generateToken(user._id);
      res.json({ success: true, message: 'Login successful', token, user: user.toJSON() });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
];

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toJSON() });
};

// PUT /api/auth/vault-setup
const setupVault = async (req, res) => {
  try {
    const { categories } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { vaultCreated: true, documentCategories: categories || [] },
      { new: true }
    );
    res.json({ success: true, message: 'Vault created!', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, setupVault };
