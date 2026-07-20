const ShareLink = require('../models/ShareLink.model');
const Document = require('../models/Document.model');
const crypto = require('crypto');

// POST /api/share
const createShareLink = async (req, res) => {
  try {
    const { documentId, expiresIn = '24h', accessType = 'view', maxAccess = null, useOtp = false } = req.body;
    const doc = await Document.findOne({ _id: documentId, userId: req.user._id, isDeleted: false });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const expiryMap = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
    const hours = expiryMap[expiresIn] || 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    const otp = useOtp ? Math.floor(100000 + Math.random() * 900000).toString() : null;
    const otpExpires = otp ? new Date(Date.now() + hours * 60 * 60 * 1000) : null;

    const shareLink = await ShareLink.create({
      documentId,
      userId: req.user._id,
      expiresAt,
      accessType,
      maxAccess,
      otp,
      otpExpires,
    });

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareLink.token}`;
    res.status(201).json({ success: true, shareUrl, token: shareLink.token, otp, expiresAt, shareLink });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/share/:token — public endpoint
const accessShare = async (req, res) => {
  try {
    const { token } = req.params;
    const { otp } = req.query;

    const shareLink = await ShareLink.findOne({ token }).populate('documentId');
    if (!shareLink || !shareLink.isActive) return res.status(404).json({ success: false, message: 'Link not found or expired' });
    if (shareLink.expiresAt < new Date()) return res.status(410).json({ success: false, message: 'Link has expired' });
    if (shareLink.maxAccess && shareLink.accessCount >= shareLink.maxAccess) return res.status(403).json({ success: false, message: 'Access limit reached' });
    if (shareLink.otp && shareLink.otp !== otp) return res.status(401).json({ success: false, message: 'Invalid OTP', requiresOtp: true });

    // Log access
    shareLink.accessCount++;
    shareLink.accessLog.push({ accessedAt: new Date(), ip: req.ip });
    await shareLink.save();

    res.json({
      success: true,
      document: {
        title: shareLink.documentId.title,
        documentType: shareLink.documentId.documentType,
        fileUrl: shareLink.documentId.fileUrl,
        aiSummary: shareLink.documentId.aiSummary,
        category: shareLink.documentId.category,
      },
      accessType: shareLink.accessType,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/share — get all share links for user
const getShareLinks = async (req, res) => {
  try {
    const links = await ShareLink.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .populate('documentId', 'title documentType');
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/share/:id
const revokeShare = async (req, res) => {
  try {
    await ShareLink.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    res.json({ success: true, message: 'Share link revoked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createShareLink, accessShare, getShareLinks, revokeShare };
