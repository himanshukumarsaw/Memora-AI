const Reminder = require('../models/Reminder.model');

// GET /api/reminders
const getReminders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    const reminders = await Reminder.find(filter)
      .sort({ dueDate: 1 })
      .populate('documentId', 'title documentType fileUrl');
    res.json({ success: true, reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reminders
const createReminder = async (req, res) => {
  try {
    const { title, description, dueDate, documentId, reminderType, priority } = req.body;
    if (!title || !dueDate) return res.status(400).json({ success: false, message: 'Title and due date are required' });
    const reminder = await Reminder.create({
      userId: req.user._id,
      title,
      description,
      dueDate: new Date(dueDate),
      documentId: documentId || null,
      reminderType: reminderType || 'custom',
      priority: priority || 'medium',
    });
    res.status(201).json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reminders/:id
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reminders/:id
const deleteReminder = async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getReminders, createReminder, updateReminder, deleteReminder };
