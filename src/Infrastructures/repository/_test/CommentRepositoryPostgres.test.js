const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
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

    // Assert return value
    expect(added).toStrictEqual({ id: 'comment-123', content: 'a comment', owner: 'user-comment-1' });

    // Assert database persistence
    const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
    expect(comments).toHaveLength(1);
    expect(comments[0].id).toEqual('comment-123');
    expect(comments[0].content).toEqual('a comment');
    expect(comments[0].owner).toEqual('user-comment-1');
    expect(comments[0].thread_id).toEqual('thread-comment-1');
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

      // Assert array length and structure
      expect(res).toHaveLength(2);

      // Assert all properties for first comment
      expect(res[0]).toHaveProperty('id', 'comment-a');
      expect(res[0]).toHaveProperty('username', 'ux');
      expect(res[0]).toHaveProperty('content', 'A');
      expect(res[0]).toHaveProperty('date');
      expect(res[0]).toHaveProperty('is_delete', false);
      expect(res[0].date).toBeInstanceOf(Date);

      // Assert all properties for second comment
      expect(res[1]).toHaveProperty('id', 'comment-b');
      expect(res[1]).toHaveProperty('username', 'uy');
      expect(res[1]).toHaveProperty('content', 'B');
      expect(res[1]).toHaveProperty('date');
      expect(res[1]).toHaveProperty('is_delete', false);
      expect(res[1].date).toBeInstanceOf(Date);
    });
  });

  describe('ownership and deletion', () => {
    it('verifyCommentExists should throw when not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentExists('comment-x')).rejects.toThrow(NotFoundError);
    });

    it('verifyCommentExists should not throw when found', async () => {
      // Setup: Use test helpers
      await UsersTableTestHelper.addUser({ id: 'user-comment-4', username: 'uabc' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-3', owner: 'user-comment-4' });
      await CommentsTableTestHelper.addComment({ id: 'comment-found', content: 'c', owner: 'user-comment-4', threadId: 'thread-comment-3' });
      
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentExists('comment-found')).resolves.not.toThrow(NotFoundError);
    });

    it('verifyCommentOwner should throw AuthorizationError when not owner', async () => {
      // Setup: Use test helpers
      await UsersTableTestHelper.addUser({ id: 'user-comment-5', username: 'uabc2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-4', owner: 'user-comment-5' });
      await CommentsTableTestHelper.addComment({ id: 'comment-own', content: 'c', owner: 'user-comment-5', threadId: 'thread-comment-4' });
      
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-own', 'user-other')).rejects.toThrow(AuthorizationError);
    });

    it('verifyCommentOwner should pass when owner matches', async () => {
      // Setup: Use test helpers
      await UsersTableTestHelper.addUser({ id: 'user-comment-6', username: 'uabc3' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment-5', owner: 'user-comment-6' });
      await CommentsTableTestHelper.addComment({ id: 'comment-own2', content: 'c', owner: 'user-comment-6', threadId: 'thread-comment-5' });
      
      const repo = new CommentRepositoryPostgres(pool, () => 'x');
      await expect(repo.verifyCommentOwner('comment-own2', 'user-comment-6')).resolves.not.toThrow(AuthorizationError);
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

  describe('like and unlike comments', () => {
    beforeEach(async () => {
      // Setup base data for like tests
      await UsersTableTestHelper.addUser({ id: 'user-like-1', username: 'user1' });
      await UsersTableTestHelper.addUser({ id: 'user-like-2', username: 'user2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-like-1', owner: 'user-like-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-like-1', content: 'test comment', owner: 'user-like-1', threadId: 'thread-like-1' });
    });

    describe('likeComment', () => {
      it('should persist like and return like id', async () => {
        const fakeIdGenerator = () => '123';
        const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        const result = await repo.likeComment('comment-like-1', 'user-like-2');

        expect(result).toStrictEqual({ id: 'like-123' });

        const likes = await CommentLikesTableTestHelper.findLikeById('like-123');
        expect(likes).toHaveLength(1);
        expect(likes[0].comment_id).toEqual('comment-like-1');
        expect(likes[0].user_id).toEqual('user-like-2');
      });
    });

    describe('unlikeComment', () => {
      it('should remove like from database', async () => {
        const repo = new CommentRepositoryPostgres(pool, () => 'x');
        
        // Setup: Add a like first
        await CommentLikesTableTestHelper.likeComment({ id: 'like-to-remove', commentId: 'comment-like-1', userId: 'user-like-2' });

        await repo.unlikeComment('comment-like-1', 'user-like-2');

        const likes = await CommentLikesTableTestHelper.findLikeByCommentAndUser('comment-like-1', 'user-like-2');
        expect(likes).toHaveLength(0);
      });
    });

    describe('verifyCommentLike', () => {
      it('should return false when user has not liked comment', async () => {
        const repo = new CommentRepositoryPostgres(pool, () => 'x');

        const result = await repo.verifyCommentLike('comment-like-1', 'user-like-2');

        expect(result).toBe(false);
      });

      it('should return true when user has liked comment', async () => {
        const repo = new CommentRepositoryPostgres(pool, () => 'x');
        
        // Setup: Add a like
        await CommentLikesTableTestHelper.likeComment({ id: 'like-verify', commentId: 'comment-like-1', userId: 'user-like-2' });

        const result = await repo.verifyCommentLike('comment-like-1', 'user-like-2');

        expect(result).toBe(true);
      });
    });

    describe('getLikeCountByCommentId', () => {
      it('should return 0 when no likes', async () => {
        const repo = new CommentRepositoryPostgres(pool, () => 'x');

        const count = await repo.getLikeCountByCommentId('comment-like-1');

        expect(count).toBe(0);
      });

      it('should return correct count when multiple likes', async () => {
        const repo = new CommentRepositoryPostgres(pool, () => 'x');
        
        // Setup: Add multiple likes
        await CommentLikesTableTestHelper.likeComment({ id: 'like-count-1', commentId: 'comment-like-1', userId: 'user-like-1' });
        await CommentLikesTableTestHelper.likeComment({ id: 'like-count-2', commentId: 'comment-like-1', userId: 'user-like-2' });

        const count = await repo.getLikeCountByCommentId('comment-like-1');

        expect(count).toBe(2);
      });
    });
  });
});


