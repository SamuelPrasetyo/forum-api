const AddReplyCommentUseCase = require('../../../../Applications/use_case/AddReplyCommentUseCase');
const DeleteReplyCommentUseCase = require('../../../../Applications/use_case/DeleteReplyCommentUseCase');

class ReplyThreadCommentsHandler {
  constructor(container) {
    this._container = container;

    this.postReplyCommentHandler = this.postReplyCommentHandler.bind(this);
    this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
  }

  async postReplyCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
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
    const { id: owner } = request.auth.credentials;
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
