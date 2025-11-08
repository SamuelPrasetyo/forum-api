const DeleteReplyComment = require('../DeleteReplyComment');

describe('a DeleteReplyComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
    };

    // Action and Assert
    expect(() => new DeleteReplyComment(payload)).toThrowError(
      'DELETE_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      replyId: 123,
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action and Assert
    expect(() => new DeleteReplyComment(payload)).toThrowError(
      'DELETE_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create deleteReplyComment object correctly', () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action
    const deleteReplyComment = new DeleteReplyComment(payload);

    // Assert
    expect(deleteReplyComment.replyId).toEqual(payload.replyId);
    expect(deleteReplyComment.owner).toEqual(payload.owner);
    expect(deleteReplyComment.threadId).toEqual(payload.threadId);
    expect(deleteReplyComment.commentId).toEqual(payload.commentId);
  });
});
