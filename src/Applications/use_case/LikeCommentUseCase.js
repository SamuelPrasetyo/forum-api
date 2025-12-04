class LikeCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  // async execute(useCasePayload) {
  //   const { threadId, commentId, userId } = useCasePayload;

  //   // Verify thread exists
  //   await this._threadRepository.verifyAvailableThread(threadId);

  //   // Verify comment exists
  //   await this._commentRepository.verifyCommentExists(commentId);

  //   // Check if user has already liked the comment
  //   const isLiked = await this._commentRepository.verifyCommentLike(commentId, userId);

  //   if (isLiked) {
  //     // Unlike the comment
  //     await this._commentRepository.unlikeComment(commentId, userId);
  //   } else {
  //     // Like the comment
  //     await this._commentRepository.likeComment(commentId, userId);
  //   }
  // }
}

module.exports = LikeCommentUseCase;
