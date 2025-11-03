const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('CommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should persist comment and return added comment', async () => {
    const payload = { content: 'a comment', owner: 'user-123', threadId: 'thread-123' };
    const fakeIdGenerator = () => '123';
    const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    await pool.query({ text: 'DELETE FROM comments WHERE thread_id=$1', values: ['thread-123'] });
    await pool.query({ text: 'DELETE FROM threads WHERE id=$1', values: ['thread-123'] });
    await pool.query({ text: 'INSERT INTO threads VALUES($1,$2,$3,$4)', values: ['thread-123','t','b','user-xxx'] });
    const added = await repo.addComment(payload);

    expect(added).toStrictEqual({ id: 'comment-123', content: 'a comment', owner: 'user-123' });
  });
});


