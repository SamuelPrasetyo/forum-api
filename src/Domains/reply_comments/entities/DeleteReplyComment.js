class DeleteReplyComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { replyId, owner, threadId, commentId } = payload;

    this.replyId = replyId;
    this.owner = owner;
    this.threadId = threadId;
    this.commentId = commentId;
  }

  _verifyPayload({ replyId, owner, threadId, commentId }) {
    if (!replyId || !owner || !threadId || !commentId) {
      throw new Error('DELETE_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof replyId !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyComment;
