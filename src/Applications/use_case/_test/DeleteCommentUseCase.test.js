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
    mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue({ id: commentId, thread_id: threadId, owner });
    mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.deleteComment = jest.fn().mockResolvedValue();

    const useCase = new DeleteCommentUseCase({ threadRepository: mockThreadRepository, commentRepository: mockCommentRepository });
    await useCase.execute({ threadId, commentId, owner });

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });

  it('should throw NotFoundError when comment does not belong to thread', async () => {
    const threadId = 'thread-1';
    const commentId = 'comment-1';
    const owner = 'user-1';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue({ id: commentId, thread_id: 'different-thread', owner });

    const useCase = new (require('../DeleteCommentUseCase'))({ threadRepository: mockThreadRepository, commentRepository: mockCommentRepository });
    await expect(useCase.execute({ threadId, commentId, owner })).rejects.toThrow('komentar tidak ditemukan pada thread');
  });
});


