const ReplyCommentsRepository = require('../../Domains/reply_comments/ReplyCommentsRepository');

class ReplyCommentsRepositoryPostgres extends ReplyCommentsRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplyComment({ content, owner, commentId }) {
    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO reply_comments(id, content, owner, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }  
}

module.exports = ReplyCommentsRepositoryPostgres;