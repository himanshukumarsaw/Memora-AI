const BaseRepository = require('./base.repository');
const User = require('../models/User.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  async createUser(data) {
    return User.create(data);
  }

  async incrementStorage(userId, bytes) {
    return User.findByIdAndUpdate(userId, { $inc: { storageUsed: bytes } }, { new: true });
  }

  async decrementStorage(userId, bytes) {
    return User.findByIdAndUpdate(userId, { $inc: { storageUsed: -bytes } }, { new: true });
  }

  async setVaultCreated(userId, categories = []) {
    return User.findByIdAndUpdate(
      userId,
      { vaultCreated: true, documentCategories: categories },
      { new: true }
    );
  }
}

module.exports = new UserRepository();
