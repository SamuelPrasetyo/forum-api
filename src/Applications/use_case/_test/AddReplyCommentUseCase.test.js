const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');

describe('AddReplyCommentUseCase', () => {
  it('should orchestrate add reply comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a reply comment',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockReplyCommentRepository = {
      addReplyComment: jest.fn().mockResolvedValue({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    };

    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
    };

    const mockThreadRepository = {
      verifyAvailableThread: jest.fn().mockResolvedValue(),
    };

    const addReplyCommentUseCase = new AddReplyCommentUseCase({
      replyCommentRepository: mockReplyCommentRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReplyComment = await addReplyCommentUseCase.execute(
      useCasePayload
    );

    // Assert
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      'comment-123'
    );
    expect(mockReplyCommentRepository.addReplyComment).toBeCalledWith({
      content: 'a reply comment',
      owner: 'user-123',
      commentId: 'comment-123',
    });
    expect(addedReplyComment).toStrictEqual({
      id: 'reply-123',
      content: 'a reply comment',
      owner: 'user-123',
    });
  });
});
