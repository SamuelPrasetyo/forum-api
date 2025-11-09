class ReplyCommentsRepository {
  async addReplyComment(_replyComment) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyReplyExists(_replyId) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyReplyOwner(_replyId, _owner) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteReplyComment(_replyId) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getRepliesByCommentId(_commentId) {
    throw new Error('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ReplyCommentsRepository;
