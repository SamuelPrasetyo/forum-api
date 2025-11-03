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

  describe('getCommentsByThreadId', () => {
    it('should return empty array when no comments found', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE thread_id=$1', values: ['thread-empty'] });
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      const res = await repo.getCommentsByThreadId('thread-empty');
      expect(Array.isArray(res)).toBe(true);
      expect(res).toHaveLength(0);
    });

    it('should return comments correctly', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE thread_id=$1', values: ['thread-abc'] });
      await pool.query({ text: 'DELETE FROM threads WHERE id=$1', values: ['thread-abc'] });
      await pool.query({ text: 'INSERT INTO threads(id,title,body,owner) VALUES($1,$2,$3,$4)', values: ['thread-abc','t','b','user-xxx'] });
      await pool.query({ text: 'INSERT INTO users(id,username,password,fullname) VALUES($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING', values: ['user-xxx','ux','p','f'] });
      await pool.query({ text: 'INSERT INTO users(id,username,password,fullname) VALUES($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING', values: ['user-yyy','uy','p','f'] });
      await pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1,$2,$3,$4)', values: ['comment-a','A','user-xxx','thread-abc'] });
      await pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1,$2,$3,$4)', values: ['comment-b','B','user-yyy','thread-abc'] });

      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      const res = await repo.getCommentsByThreadId('thread-abc');
      expect(res).toHaveLength(2);
      expect(res[0]).toHaveProperty('id');
      expect(res[0]).toHaveProperty('username');
      expect(res[0]).toHaveProperty('date');
      expect(res[0]).toHaveProperty('content');
      expect(res[0]).toHaveProperty('is_delete');
    });
  });

  describe('ownership and deletion', () => {
    it('verifyCommentExists should throw when not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentExists('comment-x')).rejects.toThrow('COMMENT.NOT_FOUND');
    });

    it('verifyCommentExists should return row when found', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE id=$1', values: ['comment-found'] });
      await pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1,$2,$3,$4)', values: ['comment-found','c','user-abc','thread-abc'] });
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      const row = await repo.verifyCommentExists('comment-found');
      expect(row).toMatchObject({ id: 'comment-found', thread_id: 'thread-abc', owner: 'user-abc' });
    });

    it('verifyCommentOwner should throw AuthorizationError when not owner', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE id=$1', values: ['comment-own'] });
      await pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1,$2,$3,$4)', values: ['comment-own','c','user-abc','thread-abc'] });
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-own', 'user-other')).rejects.toThrow('anda tidak berhak mengakses resource ini');
    });

    it('verifyCommentOwner should throw COMMENT.NOT_FOUND when comment missing', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE id=$1', values: ['comment-missing'] });
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-missing', 'user-any')).rejects.toThrow('COMMENT.NOT_FOUND');
    });

    it('verifyCommentOwner should pass when owner matches', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE id=$1', values: ['comment-own2'] });
      await pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1,$2,$3,$4)', values: ['comment-own2','c','user-abc','thread-abc'] });
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-own2', 'user-abc')).resolves.toBeUndefined();
    });

    it('deleteComment should set is_delete true', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE id=$1', values: ['comment-del'] });
      await pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id, is_delete) VALUES($1,$2,$3,$4,$5)', values: ['comment-del','c','user-abc','thread-abc', false] });
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await repo.deleteComment('comment-del');
      const res = await pool.query({ text: 'SELECT is_delete FROM comments WHERE id=$1', values: ['comment-del'] });
      expect(res.rows[0].is_delete).toBe(true);
    });
  });
});


