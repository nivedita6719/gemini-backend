const pool = require('../config/db');

exports.create = (userId, name) => {
  return pool.query(
    'INSERT INTO chatrooms (user_id, name) VALUES ($1, $2) RETURNING *',
    [userId, name]
  );
};

exports.getAllByUser = (userId) => {
  return pool.query('SELECT * FROM chatrooms WHERE user_id = $1', [userId]);
};

exports.getById = (id, userId) => {
  return pool.query('SELECT * FROM chatrooms WHERE id = $1 AND user_id = $2', [id, userId]);
};
