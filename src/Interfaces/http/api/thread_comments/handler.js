const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager');
const AuthenticationError = require('../../../../Commons/exceptions/AuthenticationError');

class ThreadCommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { authorization } = request.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = authorization.substring(7);
    const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
    await authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await authenticationTokenManager.decodePayload(token);

    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      threadId,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: { addedComment },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadCommentsHandler;


