const DeleteReplyComment = require('../../Domains/reply_comments/entities/DeleteReplyComment');

class DeleteReplyCommentUseCase {
  constructor({ replyCommentRepository, commentRepository, threadRepository }) {
    this._replyCommentRepository = replyCommentRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const deleteReplyComment = new DeleteReplyComment(useCasePayload);
    await this._threadRepository.verifyAvailableThread(deleteReplyComment.threadId);
    await this._commentRepository.verifyCommentExists(deleteReplyComment.commentId);
    await this._replyCommentRepository.verifyReplyExists(deleteReplyComment.replyId);
    await this._replyCommentRepository.verifyReplyOwner(deleteReplyComment.replyId, deleteReplyComment.owner);
    await this._replyCommentRepository.deleteReplyComment(deleteReplyComment.replyId);
  }
}

module.exports = DeleteReplyCommentUseCase;
