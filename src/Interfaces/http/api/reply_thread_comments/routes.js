const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyCommentHandler,
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
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyCommentHandler,
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
