const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('ThreadRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should persist thread and return added thread correctly', async () => {
    // Arrange
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
