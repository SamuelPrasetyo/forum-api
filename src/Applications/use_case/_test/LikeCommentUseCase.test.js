const LikeCommentUseCase = require('../LikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('LikeCommentUseCase', () => {
  it('should orchestrate like comment correctly when not yet liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentLike = jest.fn().mockResolvedValue(false);
    mockCommentRepository.likeComment = jest.fn().mockResolvedValue();
    mockCommentRepository.unlikeComment = jest.fn();

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();

    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentLike).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.likeComment).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.unlikeComment).not.toBeCalled();
  });

  it('should orchestrate unlike comment correctly when already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentLike = jest.fn().mockResolvedValue(true);
    mockCommentRepository.likeComment = jest.fn();
    mockCommentRepository.unlikeComment = jest.fn().mockResolvedValue();

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();

    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentLike).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.unlikeComment).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.likeComment).not.toBeCalled();
  });
});
