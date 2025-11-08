const ReplyCommentRepositoryPostgres = require('../ReplyCommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('ReplyCommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should persist reply comment and return added reply comment', async () => {
    const payload = { content: 'a reply comment', owner: 'user-123', commentId: 'comment-123' };
    const fakeIdGenerator = () => '123';
    const repo = new ReplyCommentRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    await pool.query({ text: 'DELETE FROM reply_comments WHERE comment_id=$1', values: ['comment-123'] });
    await pool.query({ text: 'DELETE FROM comments WHERE thread_id=$1', values: ['thread-123'] });
    await pool.query({ text: 'DELETE FROM threads WHERE id=$1', values: ['thread-123'] });
    await pool.query({ text: 'INSERT INTO threads VALUES($1,$2,$3,$4)', values: ['thread-123','t','b','user-xxx'] });
    await pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1,$2,$3,$4)', values: ['comment-123','c','user-xxx','thread-123'] });
    const added = await repo.addReplyComment(payload);

    expect(added).toStrictEqual({ id: 'reply-123', content: 'a reply comment', owner: 'user-123' });
  });
});