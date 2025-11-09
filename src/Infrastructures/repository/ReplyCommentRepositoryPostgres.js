const ReplyCommentsRepository = require('../../Domains/reply_comments/ReplyCommentsRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

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

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT id, owner FROM reply_comments WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyReplyOwner(replyId, owner) {
    const reply = await this.verifyReplyExists(replyId);

    if (reply.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReplyComment(replyId) {
    const query = {
      text: 'UPDATE reply_comments SET is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT rc.id, rc.content, rc.date, rc.is_delete, u.username
             FROM reply_comments rc
             INNER JOIN users u ON rc.owner = u.id
             WHERE rc.comment_id = $1
             ORDER BY rc.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyCommentsRepositoryPostgres;
