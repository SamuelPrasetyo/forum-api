const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    await this._threadRepository.verifyAvailableThread(addComment.threadId);
    return this._commentRepository.addComment({
      content: addComment.content,
      owner: addComment.owner,
      threadId: addComment.threadId,
    });
  }
}

module.exports = AddCommentUseCase;


