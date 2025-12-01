const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should respond 200 and like comment when user has not liked', async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'a thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'a comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // Action - Like comment
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Verify like was added to database
      const likes = await CommentLikesTableTestHelper.findLikeByCommentAndUser(addedComment.id, addedComment.owner);
      expect(likes).toHaveLength(1);
    });

    it('should respond 200 and unlike comment when user has already liked', async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'a thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // Add comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'a comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // First like
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action - Unlike comment
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Verify like was removed from database
      const likes = await CommentLikesTableTestHelper.findLikeByCommentAndUser(addedComment.id, addedComment.owner);
      expect(likes).toHaveLength(0);
    });

    it('should respond 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should respond 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Add user and login
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action - Try to like comment on non-existent thread
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-notfound/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should respond 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'a thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // Action - Try to like non-existent comment
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/comment-notfound/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('GET /threads/{threadId} with like counts', () => {
    it('should include likeCount in comment details', async () => {
      // Arrange
      const server = await createServer(container);

      // Create two users
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'user1',
          password: 'secret',
          fullname: 'User One',
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'user2',
          password: 'secret',
          fullname: 'User Two',
        },
      });

      // Login as user1
      const loginResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'user1',
          password: 'secret',
        },
      });
      const { data: { accessToken: accessToken1 } } = JSON.parse(loginResponse1.payload);

      // Login as user2
      const loginResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'user2',
          password: 'secret',
        },
      });
      const { data: { accessToken: accessToken2 } } = JSON.parse(loginResponse2.payload);

      // User1 creates thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'a thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      const { data: { addedThread } } = JSON.parse(threadResponse.payload);

      // User1 adds comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'a comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // User1 likes the comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // User2 likes the comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Action - Get thread details
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(2);
    });
  });
});
