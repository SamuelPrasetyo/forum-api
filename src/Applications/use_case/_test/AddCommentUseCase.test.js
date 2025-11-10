const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a comment',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = jest.fn().mockResolvedValue({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith({
      content: 'a comment',
      owner: 'user-123',
      threadId: 'thread-123',
    });
    expect(addedComment).toStrictEqual({
      id: 'comment-123',
      content: 'a comment',
      owner: 'user-123',
    });
  });
});


