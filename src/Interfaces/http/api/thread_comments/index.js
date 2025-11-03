const routes = require('./routes');
const ThreadCommentsHandler = require('./handler');

module.exports = {
  name: 'thread_comments',
  register: async (server, { container }) => {
    const handler = new ThreadCommentsHandler(container);
    server.route(routes(handler));
  },
};


