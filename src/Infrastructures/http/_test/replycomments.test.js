const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ReplyCommentsTableTestHelper = require('../../../../tests/ReplyCommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await ReplyCommentsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ReplyCommentsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should response 201 and persisted reply', async () => {
    const server = await createServer(container);
    
    // register user
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' } });
    // login
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);

    // Get user id
    const userIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['dicoding'] });
    const userId = userIdRes.rows[0].id;

    // create thread and comment with actual user
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments/comment-123/replies',
      payload: { content: 'a reply' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(json.status).toEqual('success');
    expect(json.data.addedReply.id).toBeDefined();
    expect(json.data.addedReply.content).toEqual('a reply');
    expect(json.data.addedReply.owner).toBeDefined();
  });

  it('should response 401 when access token is missing', async () => {
    const server = await createServer(container);

    // Create user for foreign key constraint
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'testuser', password: 'secret', fullname: 'Test User' } });
    const userIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['testuser'] });
    const userId = userIdRes.rows[0].id;

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments/comment-123/replies',
      payload: { content: 'a reply' },
    });

    const json = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(401);
    expect(json.status).toEqual('fail');
  });

  it('should response 404 when comment not found', async () => {
    const server = await createServer(container);
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' } });
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);
    // await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-DUMMY' });

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments/comment-404/replies',
      payload: { content: 'a reply' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(json.status).toEqual('fail');
    expect(json.message).toBeDefined();
  });

  it('should response 404 when thread not found', async () => {
    const server = await createServer(container);
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' } });
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);

    // Get user id
    const userIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['dicoding'] });
    const userId = userIdRes.rows[0].id;

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-404/comments/comment-123/replies',
      payload: { content: 'a reply' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(json.status).toEqual('fail');
    expect(json.message).toBeDefined();
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should delete reply and return 200', async () => {
      const server = await createServer(container);

      // Register users
      await server.inject({ method: 'POST', url: '/users', payload: { username: 'owner', password: 'secret', fullname: 'Owner' } });
      const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'owner', password: 'secret' } });
      const { data: { accessToken } } = JSON.parse(login.payload);

      // Get user id
      const ownerIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['owner'] });
      const ownerId = ownerIdRes.rows[0].id;

      // Add thread, comment, and reply
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: ownerId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: ownerId });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', commentId: 'comment-123', owner: ownerId });

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(json.status).toEqual('success');

      // Verify soft delete
      const replies = await ReplyCommentsTableTestHelper.findReplyCommentsById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });

    it('should response 403 when user is not owner', async () => {
      const server = await createServer(container);

      // Register users
      await server.inject({ method: 'POST', url: '/users', payload: { username: 'owner', password: 'secret', fullname: 'Owner' } });
      await server.inject({ method: 'POST', url: '/users', payload: { username: 'other', password: 'secret', fullname: 'Other' } });
      const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'other', password: 'secret' } });
      const { data: { accessToken } } = JSON.parse(login.payload);

      const ownerIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['owner'] });
      const ownerId = ownerIdRes.rows[0].id;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: ownerId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: ownerId });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', commentId: 'comment-123', owner: ownerId });

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(json.status).toEqual('fail');
      expect(json.message).toBeDefined();
    });

    it('should response 404 when reply not found', async () => {
      const server = await createServer(container);

      await server.inject({ method: 'POST', url: '/users', payload: { username: 'owner', password: 'secret', fullname: 'Owner' } });
      const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'owner', password: 'secret' } });
      const { data: { accessToken } } = JSON.parse(login.payload);

      const ownerIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['owner'] });
      const ownerId = ownerIdRes.rows[0].id;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: ownerId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: ownerId });

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-xxx',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(json.status).toEqual('fail');
      expect(json.message).toBeDefined();
    });

    it('should response 401 when access token is missing', async () => {
      const server = await createServer(container);

      // Create user for foreign key constraint
      await server.inject({ method: 'POST', url: '/users', payload: { username: 'testuser2', password: 'secret', fullname: 'Test User 2' } });
      const userIdRes = await pool.query({ text: 'SELECT id FROM users WHERE username=$1', values: ['testuser2'] });
      const userId = userIdRes.rows[0].id;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
      await ReplyCommentsTableTestHelper.addReplyComment({ id: 'reply-123', commentId: 'comment-123', owner: userId });

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      const json = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(json.status).toEqual('fail');
    });
  });
});