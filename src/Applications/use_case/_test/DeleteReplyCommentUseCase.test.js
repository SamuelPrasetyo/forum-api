const DeleteReplyCommentUseCase = require('../DeleteReplyCommentUseCase');
const DeleteReplyComment = require('../../../Domains/reply_comments/entities/DeleteReplyComment');
const ReplyCommentsRepository = require('../../../Domains/reply_comments/ReplyCommentsRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteReplyCommentUseCase', () => {
  it('should orchestrate delete reply comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockReplyCommentRepository = new ReplyCommentsRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
    mockReplyCommentRepository.verifyReplyExists = jest.fn().mockResolvedValue();
    mockReplyCommentRepository.verifyReplyOwner = jest.fn().mockResolvedValue();
    mockReplyCommentRepository.deleteReplyComment = jest.fn().mockResolvedValue();

    const deleteReplyCommentUseCase = new DeleteReplyCommentUseCase({
      replyCommentRepository: mockReplyCommentRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith('comment-123');
    expect(mockReplyCommentRepository.verifyReplyExists).toBeCalledWith('reply-123');
    expect(mockReplyCommentRepository.verifyReplyOwner).toBeCalledWith('reply-123', 'user-123');
    expect(mockReplyCommentRepository.deleteReplyComment).toBeCalledWith('reply-123');
  });
});
