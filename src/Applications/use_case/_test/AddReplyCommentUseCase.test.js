const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');
const ReplyCommentsRepository = require('../../../Domains/reply_comments/ReplyCommentsRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyCommentUseCase', () => {
  it('should orchestrate add reply comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a reply comment',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockReplyCommentRepository = new ReplyCommentsRepository();
    mockReplyCommentRepository.addReplyComment = jest.fn().mockResolvedValue({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();

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
