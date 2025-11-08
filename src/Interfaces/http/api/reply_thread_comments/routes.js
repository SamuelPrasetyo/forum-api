const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyCommentHandler,
  }
]);

module.exports = routes;