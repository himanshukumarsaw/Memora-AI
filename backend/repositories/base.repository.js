// ─── repositories/base.repository.js ─────────────────────────────────────────
// Generic CRUD repository that every specific repository extends.
// Controllers → Services → Repository → MongoDB.
// Changing the database only requires changing the Repository layer.

class BaseRepository {
  constructor(Model) {
    this.Model = Model;
  }

  /** Create a single document */
  async create(data) {
    return this.Model.create(data);
  }

  /** Find by primary key */
  async findById(id, projection = '') {
    return this.Model.findById(id).select(projection);
  }

  /** Find one by arbitrary filter */
  async findOne(filter, projection = '') {
    return this.Model.findOne(filter).select(projection);
  }

  /** Find many by filter with optional sort, skip, limit */
  async findMany(filter = {}, { sort = { createdAt: -1 }, skip = 0, limit = 20, projection = '' } = {}) {
    return this.Model.find(filter).select(projection).sort(sort).skip(skip).limit(limit);
  }

  /** Count documents matching filter */
  async count(filter = {}) {
    return this.Model.countDocuments(filter);
  }

  /** Find-by-id then update; returns updated document */
  async updateById(id, update, options = { new: true, runValidators: true }) {
    return this.Model.findByIdAndUpdate(id, update, options);
  }

  /** Find-one-by-filter then update */
  async updateOne(filter, update, options = { new: true, runValidators: true }) {
    return this.Model.findOneAndUpdate(filter, update, options);
  }

  /** Hard delete by id */
  async deleteById(id) {
    return this.Model.findByIdAndDelete(id);
  }

  /** Hard delete by filter */
  async deleteMany(filter) {
    return this.Model.deleteMany(filter);
  }

  /** Mongoose aggregation pipeline */
  async aggregate(pipeline) {
    return this.Model.aggregate(pipeline);
  }

  /** Populate helper — returns lean result with specified paths populated */
  async findWithPopulate(filter, populatePaths = [], projection = '') {
    let query = this.Model.find(filter).select(projection);
    populatePaths.forEach((p) => (query = query.populate(p)));
    return query;
  }
}

module.exports = BaseRepository;
