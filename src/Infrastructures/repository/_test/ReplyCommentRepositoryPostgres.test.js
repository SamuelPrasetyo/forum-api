const ReplyCommentRepositoryPostgres = require('../ReplyCommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ReplyCommentsTableTestHelper = require('../../../../tests/ReplyCommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyCommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await ReplyCommentsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ReplyCommentsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addReplyComment function', () => {
    it('should persist reply comment and return added reply comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const payload = { content: 'a reply comment', owner: 'user-123', commentId: 'comment-123' };
      const fakeIdGenerator = () => '123';
      const repo = new ReplyCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const added = await repo.addReplyComment(payload);

      // Assert
      expect(added).toStrictEqual({ id: 'reply-123', content: 'a reply comment', owner: 'user-123' });
    });
  });

  describe('verifyReplyExists function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const repo = new ReplyCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repo.verifyReplyExists('reply-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repo.verifyReplyExists('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when not owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repo.verifyReplyOwner('reply-123', 'user-456')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when is owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repo.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyComment function', () => {
    it('should soft delete reply comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyCommentRepositoryPostgres(pool, {});

      // Action
      await repo.deleteReplyComment('reply-123');

      // Assert
      const replies = await ReplyCommentsTableTestHelper.findReplyCommentsById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies by comment id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', content: 'reply 1', commentId: 'comment-123', owner: 'user-123' });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-456', content: 'reply 2', commentId: 'comment-123', owner: 'user-123' });

      const repo = new ReplyCommentRepositoryPostgres(pool, {});

      // Action
      const replies = await repo.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].content).toEqual('reply 1');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[1].id).toEqual('reply-456');
    });

    it('should return empty array when no replies', async () => {
      // Arrange
      const repo = new ReplyCommentRepositoryPostgres(pool, {});

      // Action
      const replies = await repo.getRepliesByCommentId('comment-xxx');

      // Assert
      expect(replies).toHaveLength(0);
    });
  });
});