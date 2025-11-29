const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ content, owner, threadId }) {
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, u.username, c.date, c.content, c.is_delete
             FROM comments c JOIN users u ON u.id = c.owner
             WHERE c.thread_id = $1
             ORDER BY c.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: 'SELECT id, thread_id, owner FROM comments WHERE id=$1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('COMMENT.NOT_FOUND');
    }
  }

  async verifyCommentOwner(commentId, ownerId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id=$1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (result.rows[0].owner !== ownerId) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete=true WHERE id=$1',
      values: [commentId],
    };
    await this._pool.query(query);
  }

  async likeComment(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes(id, comment_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async unlikeComment(commentId, userId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async verifyCommentLike(commentId, userId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = CommentRepositoryPostgres;
