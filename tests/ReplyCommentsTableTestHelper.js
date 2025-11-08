/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ReplyCommentsTableTestHelper = {
  async addReplyComment({
    id = 'reply-123',
    content = 'a reply comment',
    owner = 'user-123',
    commentId = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO reply_comments(id, content, owner, comment_id) VALUES($1, $2, $3, $4)',
      values: [id, content, owner, commentId],
    };
    await pool.query(query);
  },

  async findReplyCommentsById(id) {
    const query = {
      text: 'SELECT * FROM reply_comments WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM reply_comments WHERE 1=1');
  },
};

module.exports = ReplyCommentsTableTestHelper;
