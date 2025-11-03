const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager');
const AuthenticationError = require('../../../../Commons/exceptions/AuthenticationError');

class ThreadCommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
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

ThreadCommentsHandler.prototype.deleteCommentHandler = async function deleteCommentHandler(request) {
  const { authorization } = request.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing authentication');
  }

  const token = authorization.substring(7);
  const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
  await authenticationTokenManager.verifyAccessToken(token);
  const { id: owner } = await authenticationTokenManager.decodePayload(token);

  const { threadId, commentId } = request.params;
  const useCase = this._container.getInstance(DeleteCommentUseCase.name);
  await useCase.execute({ threadId, commentId, owner });

  return { status: 'success' };
};

module.exports = ThreadCommentsHandler;


