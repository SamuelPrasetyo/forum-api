class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ threadId, commentId, owner }) {
    await this._threadRepository.verifyAvailableThread(threadId);
    const comment = await this._commentRepository.verifyCommentExists(commentId);
    if (comment.thread_id !== threadId) {
      const NotFoundError = require('../../Commons/exceptions/NotFoundError');
      throw new NotFoundError('komentar tidak ditemukan pada thread');
    }
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;


