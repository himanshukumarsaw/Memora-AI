// ─── controllers/auth.controller.js ──────────────────────────────────────────
// Complete auth controller per 07_API_DOCUMENTATION.md
// Endpoints: register, login, logout, me, vaultSetup, refreshToken, forgotPassword, resetPassword

const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const userRepo   = require('../repositories/user.repository');
const asyncWrap  = require('../utils/asyncWrapper');
const { success, error } = require('../utils/responseHandler');
const AppError   = require('../utils/appError');
const logger     = require('../utils/logger');

const JWT_SECRET         = process.env.JWT_SECRET         || 'memora_secret_key_dev';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'memora_refresh_secret_dev';

const generateAccessToken  = (userId) => jwt.sign({ userId }, JWT_SECRET,         { expiresIn: '7d'  });
const generateRefreshToken = (userId) => jwt.sign({ userId }, JWT_REFRESH_SECRET,  { expiresIn: '30d' });

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────
const register = asyncWrap(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await userRepo.findByEmail(email);
  if (existing) throw new AppError('Email already registered.', 409, 'AUTH_002');

  const user          = await userRepo.createUser({ name, email, password });
  const accessToken   = generateAccessToken(user._id);
  const refreshToken  = generateRefreshToken(user._id);

  logger.info(`New user registered: ${email}`);

  return success(res, {
    status:  201,
    message: 'Account created successfully.',
    data:    { accessToken, refreshToken, user: user.toJSON() },
  });
});

// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────
const login = asyncWrap(async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError('Invalid email or password.', 401, 'AUTH_001');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password.', 401, 'AUTH_001');

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Record last login
  await userRepo.updateById(user._id, { lastLogin: new Date() });
  logger.info(`User logged in: ${email}`);

  return success(res, {
    message: 'Login successful.',
    data:    { accessToken, refreshToken, user: user.toJSON() },
  });
});

// ─── POST /api/v1/auth/logout ────────────────────────────────────────────────
const logout = asyncWrap(async (req, res) => {
  // Stateless JWT — client discards token.
  // If refresh token blacklisting is added later, handle it here.
  logger.info(`User logged out: ${req.user?.email}`);
  return success(res, { message: 'Logged out successfully.' });
});

// ─── POST /api/v1/auth/refresh ───────────────────────────────────────────────
const refreshToken = asyncWrap(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token required.', 400, 'AUTH_003');

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401, 'AUTH_003');
  }

  const user = await userRepo.findById(decoded.userId);
  if (!user) throw new AppError('User not found.', 401, 'AUTH_003');

  const newAccessToken = generateAccessToken(user._id);
  return success(res, {
    message: 'Token refreshed.',
    data:    { accessToken: newAccessToken },
  });
});

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────
const getMe = asyncWrap(async (req, res) => {
  return success(res, { data: req.user.toJSON(), message: 'User profile fetched.' });
});

// ─── PUT /api/v1/auth/vault-setup ────────────────────────────────────────────
const setupVault = asyncWrap(async (req, res) => {
  const { categories, vaultName } = req.body;
  const user = await userRepo.setVaultCreated(req.user._id, categories || []);
  return success(res, { message: 'Vault created successfully.', data: user.toJSON() });
});

// ─── POST /api/v1/auth/forgot-password ───────────────────────────────────────
const forgotPassword = asyncWrap(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required.', 400, 'VALIDATION_ERROR');

  const user = await userRepo.findByEmail(email);
  // Always respond generically to prevent email enumeration
  if (!user) {
    return success(res, { message: 'If this email exists, a reset link has been sent.' });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await userRepo.updateById(user._id, {
    passwordResetToken:   resetToken,
    passwordResetExpires: resetExpiry,
  });

  // TODO: send email in production
  logger.info(`Password reset token generated for: ${email} — token: ${resetToken}`);

  return success(res, { message: 'If this email exists, a reset link has been sent.' });
});

// ─── POST /api/v1/auth/reset-password ────────────────────────────────────────
const resetPassword = asyncWrap(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new AppError('Token and password are required.', 400, 'VALIDATION_ERROR');
  if (password.length < 6)  throw new AppError('Password must be at least 6 characters.', 400, 'VALIDATION_ERROR');

  const User = require('../models/User.model');
  const user = await User.findOne({
    passwordResetToken:   token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) throw new AppError('Reset token is invalid or has expired.', 400, 'AUTH_003');

  user.password = password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset successfully for: ${user.email}`);
  return success(res, { message: 'Password reset successfully. Please log in.' });
});

module.exports = { register, login, logout, getMe, setupVault, refreshToken, forgotPassword, resetPassword };
