const AddReplyCommentUseCase = require('../../../../Applications/use_case/AddReplyCommentUseCase');
const DeleteReplyCommentUseCase = require('../../../../Applications/use_case/DeleteReplyCommentUseCase');
const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager');
const AuthenticationError = require('../../../../Commons/exceptions/AuthenticationError');

class ReplyThreadCommentsHandler {
  constructor(container) {
    this._container = container;

    this.postReplyCommentHandler = this.postReplyCommentHandler.bind(this);
    this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
  }

  async postReplyCommentHandler(request, h) {
    const { authorization } = request.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = authorization.substring(7);
    const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
    await authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await authenticationTokenManager.decodePayload(token);

    const { threadId, commentId } = request.params;
    const addReplyCommentUseCase = this._container.getInstance(AddReplyCommentUseCase.name);
    const addedReply = await addReplyCommentUseCase.execute({
      ...request.payload,
      threadId,
      commentId,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: { addedReply },
    });
    response.code(201);
    return response;
  }

  async deleteReplyCommentHandler(request, h) {
    const { authorization } = request.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = authorization.substring(7);
    const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
    await authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await authenticationTokenManager.decodePayload(token);

    const { threadId, commentId, replyId } = request.params;
    const deleteReplyCommentUseCase = this._container.getInstance(DeleteReplyCommentUseCase.name);
    await deleteReplyCommentUseCase.execute({
      replyId,
      threadId,
      commentId,
      owner,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ReplyThreadCommentsHandler;