class ReplyCommentsRepository {
  async addReplyComment(replyComment) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyReplyExists(replyId) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyReplyOwner(replyId, owner) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteReplyComment(replyId) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getRepliesByCommentId(commentId) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ReplyCommentsRepository;