const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    const threadId = 'thread-1';
    const commentId = 'comment-1';
    const owner = 'user-1';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.deleteComment = jest.fn().mockResolvedValue();

    const useCase = new DeleteCommentUseCase({ threadRepository: mockThreadRepository, commentRepository: mockCommentRepository });
    await useCase.execute({ threadId, commentId, owner });

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });
});


