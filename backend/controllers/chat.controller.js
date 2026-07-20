const ChatSession = require('../models/ChatSession.model');
const Document = require('../models/Document.model');
const { ragChat } = require('../services/ai.service');

// POST /api/chat/message
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const userId = req.user._id;

    // Get or create session
    let session = sessionId
      ? await ChatSession.findOne({ _id: sessionId, userId })
      : null;

    if (!session) {
      session = await ChatSession.create({
        userId,
        title: message.substring(0, 50),
        messages: [],
      });
    }

    // Add user message
    session.messages.push({ role: 'user', content: message });

    // Fetch all ready documents for context
    const documents = await Document.find({ userId, isDeleted: false, status: 'ready' })
      .select('title documentType category extractedData aiSummary rawText embedding')
      .lean();

    // Get recent chat history
    const recentHistory = session.messages.slice(-10);

    // Generate AI response
    const aiResponse = await ragChat(message, documents, recentHistory);

    // Add AI message
    session.messages.push({ role: 'assistant', content: aiResponse });
    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      response: aiResponse,
      session,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('title updatedAt messages');
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/sessions/:id
const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/chat/sessions/:id
const deleteSession = async (req, res) => {
  try {
    await ChatSession.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendMessage, getSessions, getSession, deleteSession };
