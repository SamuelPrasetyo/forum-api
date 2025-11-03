const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  it('should response 201 and persisted comment', async () => {
    const server = await createServer(container);
    // register user
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' } });
    // login
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);
    // create thread directly in db (or via endpoint)
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-DUMMY' });

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments',
      payload: { content: 'a comment' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(json.status).toEqual('success');
    expect(json.data.addedComment.id).toBeDefined();
    expect(json.data.addedComment.content).toEqual('a comment');
    expect(json.data.addedComment.owner).toBeDefined();
  });

  it('should response 404 when thread not found', async () => {
    const server = await createServer(container);
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' } });
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-not-found/comments',
      payload: { content: 'a comment' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(json.status).toEqual('fail');
    expect(json.message).toBeDefined();
  });

  it('should response 400 when payload invalid', async () => {
    const server = await createServer(container);
    await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' } });
    const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret' } });
    const { data: { accessToken } } = JSON.parse(login.payload);
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-DUMMY' });

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments',
      payload: {},
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(400);
    expect(json.status).toEqual('fail');
    expect(json.message).toBeDefined();
  });
});


