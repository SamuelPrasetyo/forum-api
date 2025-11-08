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

    // create thread directly in db (or via endpoint)
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-DUMMY' });

    // create comment directly in db (or via endpoint)
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-DUMMY' });

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
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-DUMMY' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-DUMMY' });

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
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-DUMMY' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-DUMMY' });

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
});