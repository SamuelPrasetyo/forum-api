const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('GET /threads/{threadId}', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should response 404 when thread not found', async () => {
    const server = await createServer(container);
    const res = await server.inject({ method: 'GET', url: '/threads/thread-not-found' });
    const json = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(404);
    expect(json.status).toEqual('fail');
    expect(json.message).toBeDefined();
  });

  it('should response 200 with thread detail and comments', async () => {
    const server = await createServer(container);

    // Arrange: create user and thread, comments
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-2', username: 'johndoe' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-1', title: 'a thread', body: 'a thread body', owner: 'user-1' });
    await CommentsTableTestHelper.addComment({ id: 'comment-1', content: 'sebuah comment', owner: 'user-2', threadId: 'thread-1' });
    await CommentsTableTestHelper.addComment({ id: 'comment-2', content: 'will be deleted', owner: 'user-1', threadId: 'thread-1' });
    // mark comment-2 as deleted
    await pool.query({ text: 'UPDATE comments SET is_delete=true WHERE id=$1', values: ['comment-2'] });

    const res = await server.inject({ method: 'GET', url: '/threads/thread-1' });
    const json = JSON.parse(res.payload);

    expect(res.statusCode).toEqual(200);
    expect(json.status).toEqual('success');
    expect(json.data.thread).toBeDefined();
    expect(json.data.thread.id).toEqual('thread-1');
    expect(json.data.thread.title).toEqual('a thread');
    expect(json.data.thread.body).toEqual('a thread body');
    expect(json.data.thread.username).toEqual('dicoding');
    expect(Array.isArray(json.data.thread.comments)).toBe(true);
    expect(json.data.thread.comments).toHaveLength(2);
    expect(json.data.thread.comments[0].id).toEqual('comment-1');
    expect(json.data.thread.comments[0].content).toEqual('sebuah comment');
    expect(json.data.thread.comments[1].id).toEqual('comment-2');
    expect(json.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
  });
});


