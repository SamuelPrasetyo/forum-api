const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should delete comment and return 200', async () => {
    const server = await createServer(container);
    // create two users; commenter is user-1
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'owner', password: 'secret', fullname: 'Owner' } });
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'other', password: 'secret', fullname: 'Other' } });
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'owner', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);

    // fetch user id from DB
    const ownerIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['owner'] });
    const ownerId = ownerIdRes.rows[0].id;
    await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: ownerId });
    await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', owner: ownerId });

    const res = await server.inject({ method: 'DELETE', url: '/threads/thread-1/comments/comment-1', headers: { Authorization: `Bearer ${accessToken}` } });
    const json = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(json.status).toEqual('success');
  });

  it('should 403 when user is not owner', async () => {
    const server = await createServer(container);
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'owner', password: 'secret', fullname: 'Owner' } });
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'other', password: 'secret', fullname: 'Other' } });
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'other', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);
    const ownerIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['owner'] });
    const otherIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['other'] });
    const ownerId = ownerIdRes.rows[0].id;
    const otherId = otherIdRes.rows[0].id; // unused but kept to show retrieval
    await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: ownerId });
    await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', owner: ownerId });

    const res = await server.inject({ method: 'DELETE', url: '/threads/thread-1/comments/comment-1', headers: { Authorization: `Bearer ${accessToken}` } });
    const json = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(403);
    expect(json.status).toEqual('fail');
    expect(json.message).toBeDefined();
  });

  it('should 404 when thread or comment not found', async () => {
    const server = await createServer(container);
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'owner', password: 'secret', fullname: 'Owner' } });
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'owner', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);

    const res = await server.inject({ method: 'DELETE', url: '/threads/thread-x/comments/comment-x', headers: { Authorization: `Bearer ${accessToken}` } });
    const json = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(404);
    expect(json.status).toEqual('fail');
    expect(json.message).toBeDefined();
  });

  it('should 401 when access token is missing', async () => {
    const server = await createServer(container);
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'owner' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
    await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', owner: 'user-1' });

    const res = await server.inject({ method: 'DELETE', url: '/threads/thread-1/comments/comment-1' });
    const json = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(401);
    expect(json.status).toEqual('fail');
  });
});


