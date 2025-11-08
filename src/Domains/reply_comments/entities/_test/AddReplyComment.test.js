const AddReplyComment = require('../AddReplyComment');

describe('a AddReplyComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'This is reply comment',
    };

    // Action and Assert
    expect(() => new AddReplyComment(payload)).toThrowError(
      'ADD_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action and Assert
    expect(() => new AddReplyComment(payload)).toThrowError(
      'ADD_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create addReplyComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'This is reply comment',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action
    const addReplyComment = new AddReplyComment(payload);

    // Assert
    expect(addReplyComment.content).toEqual(payload.content);
    expect(addReplyComment.owner).toEqual(payload.owner);
    expect(addReplyComment.threadId).toEqual(payload.threadId);
    expect(addReplyComment.commentId).toEqual(payload.commentId);
  });
});