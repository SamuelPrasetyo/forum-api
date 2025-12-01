const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'forum_jwt',
      plugins: {
        'hapi-rate-limit': {
          enabled: true,
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'forum_jwt',
      plugins: {
        'hapi-rate-limit': {
          enabled: true,
        },
      },
    },
  },
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.putLikeHandler,
    options: {
      auth: 'forum_jwt',
      plugins: {
        'hapi-rate-limit': {
          enabled: true,
        },
      },
    },
  },
]);

module.exports = routes;
