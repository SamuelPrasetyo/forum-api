const routes = require('./routes');
const ReplyThreadCommentsHandler = require('./handler');

module.exports = {
  name: 'reply_thread_comments',
  register: async (server, { container }) => {
    const handler = new ReplyThreadCommentsHandler(container);
    server.route(routes(handler));
  },
};
