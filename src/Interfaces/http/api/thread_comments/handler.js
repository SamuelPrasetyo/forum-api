const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class ThreadCommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
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

  async deleteCommentHandler(request) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCase = this._container.getInstance(DeleteCommentUseCase.name);
    await useCase.execute({ threadId, commentId, owner });

    return { status: 'success' };
  }
}

module.exports = ThreadCommentsHandler;
