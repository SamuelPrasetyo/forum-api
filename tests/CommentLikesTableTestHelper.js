/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async likeComment({ id = 'like-123', commentId = 'comment-123', userId = 'user-123' }) {
    const query = {
      text: 'INSERT INTO comment_likes(id, comment_id, user_id) VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };
    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async findLikeByCommentAndUser(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
