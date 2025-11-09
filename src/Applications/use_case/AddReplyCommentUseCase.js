const AddReplyComment = require('../../Domains/reply_comments/entities/AddReplyComment');

class AddReplyCommentUseCase {
  constructor({ replyCommentRepository, commentRepository, threadRepository }) {
    this._replyCommentRepository = replyCommentRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addReplyComment = new AddReplyComment(useCasePayload);
    await this._threadRepository.verifyAvailableThread(addReplyComment.threadId);
    await this._commentRepository.verifyCommentExists(addReplyComment.commentId);
    return this._replyCommentRepository.addReplyComment({
      content: addReplyComment.content,
      owner: addReplyComment.owner,
      commentId: addReplyComment.commentId,
    });
  }
}

module.exports = AddReplyCommentUseCase;
