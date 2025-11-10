const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should persist comment and return added comment', async () => {
    const payload = { content: 'a comment', owner: 'user-comment-1', threadId: 'thread-comment-1' };
    const fakeIdGenerator = () => '123';
    const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    // Setup: Create parent records first
    await UsersTableTestHelper.addUser({ id: 'user-comment-1', username: 'usercom1' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-comment-1', owner: 'user-comment-1' });
    
    const added = await repo.addComment(payload);

    expect(added).toStrictEqual({ id: 'comment-123', content: 'a comment', owner: 'user-comment-1' });
  });

  describe('getCommentsByThreadId', () => {
    it('should return empty array when no comments found', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      const res = await repo.getCommentsByThreadId('thread-empty-xyz');
      expect(Array.isArray(res)).toBe(true);
      expect(res).toHaveLength(0);
    });

    it('should return comments correctly', async () => {
      // Setup: Use test helpers for consistency
      await UsersTableTestHelper.addUser({ id: 'user-comment-2', username: 'ux' });
      await UsersTableTestHelper.addUser({ id: 'user-comment-3', username: 'uy' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-2', owner: 'user-comment-2' });
      await CommentsTableTestHelper.addComment({ id: 'comment-a', content: 'A', owner: 'user-comment-2', threadId: 'thread-comment-2' });
      await CommentsTableTestHelper.addComment({ id: 'comment-b', content: 'B', owner: 'user-comment-3', threadId: 'thread-comment-2' });

      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      const res = await repo.getCommentsByThreadId('thread-comment-2');
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
      // Setup: Use test helpers
      await UsersTableTestHelper.addUser({ id: 'user-comment-4', username: 'uabc' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-3', owner: 'user-comment-4' });
      await CommentsTableTestHelper.addComment({ id: 'comment-found', content: 'c', owner: 'user-comment-4', threadId: 'thread-comment-3' });
      
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      const row = await repo.verifyCommentExists('comment-found');
      expect(row).toMatchObject({ id: 'comment-found', thread_id: 'thread-comment-3', owner: 'user-comment-4' });
    });

    it('verifyCommentOwner should throw AuthorizationError when not owner', async () => {
      // Setup: Use test helpers
      await UsersTableTestHelper.addUser({ id: 'user-comment-5', username: 'uabc2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-4', owner: 'user-comment-5' });
      await CommentsTableTestHelper.addComment({ id: 'comment-own', content: 'c', owner: 'user-comment-5', threadId: 'thread-comment-4' });
      
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-own', 'user-other')).rejects.toThrow('anda tidak berhak mengakses resource ini');
    });

    it('verifyCommentOwner should throw COMMENT.NOT_FOUND when comment missing', async () => {
      await pool.query({ text: 'DELETE FROM comments WHERE id=$1', values: ['comment-missing'] });
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-missing', 'user-any')).rejects.toThrow('COMMENT.NOT_FOUND');
    });

    it('verifyCommentOwner should pass when owner matches', async () => {
      // Setup: Use test helpers
      await UsersTableTestHelper.addUser({ id: 'user-comment-6', username: 'uabc3' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-5', owner: 'user-comment-6' });
      await CommentsTableTestHelper.addComment({ id: 'comment-own2', content: 'c', owner: 'user-comment-6', threadId: 'thread-comment-5' });
      
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-own2', 'user-comment-6')).resolves.toBeUndefined();
    });

    it('deleteComment should set is_delete true', async () => {
      // Setup: Use test helpers
      await UsersTableTestHelper.addUser({ id: 'user-comment-7', username: 'uabc4' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-6', owner: 'user-comment-7' });
      await CommentsTableTestHelper.addComment({ id: 'comment-del', content: 'c', owner: 'user-comment-7', threadId: 'thread-comment-6' });
      
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await repo.deleteComment('comment-del');
      const res = await pool.query({ text: 'SELECT is_delete FROM comments WHERE id=$1', values: ['comment-del'] });
      expect(res.rows[0].is_delete).toBe(true);
    });
  });
});


