const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const payload = {
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepository.addThread(payload);

      // Assert
      expect(addedThread).toStrictEqual({
        id: 'thread-123',
        title: payload.title,
        owner: payload.owner,
      });
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepository.verifyAvailableThread('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepository.verifyAvailableThread('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepository.getThreadById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread details correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123',
      });

      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepository.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('isi thread');
      expect(thread.username).toEqual('dicoding');
      expect(thread.date).toBeDefined();
    });
  });
});
