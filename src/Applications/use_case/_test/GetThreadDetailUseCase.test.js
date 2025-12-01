const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyCommentsRepository = require('../../../Domains/reply_comments/ReplyCommentsRepository');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate getting thread detail with comments and replies', async () => {
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue({
      id: threadId,
      title: 'a title',
      body: 'a body',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([
      { id: 'comment-1', username: 'john', date: new Date('2021-08-08T07:22:33.555Z'), content: 'hi', is_delete: false },
      { id: 'comment-2', username: 'doe', date: new Date('2021-08-08T07:26:21.338Z'), content: 'bye', is_delete: true },
    ]);
    mockCommentRepository.getLikeCountByCommentId = jest.fn()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(0);

    const mockReplyCommentRepository = new ReplyCommentsRepository();
    mockReplyCommentRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValueOnce([
        { id: 'reply-1', content: 'reply 1', date: new Date('2021-08-08T07:59:48.766Z'), username: 'johndoe', is_delete: false },
        { id: 'reply-2', content: 'reply 2', date: new Date('2021-08-08T08:07:01.522Z'), username: 'dicoding', is_delete: true },
      ])
      .mockResolvedValueOnce([]);

    const useCase = new GetThreadDetailUseCase({ 
      threadRepository: mockThreadRepository, 
      commentRepository: mockCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
    });
    const result = await useCase.execute(threadId);

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockCommentRepository.getLikeCountByCommentId).toBeCalledWith('comment-1');
    expect(mockCommentRepository.getLikeCountByCommentId).toBeCalledWith('comment-2');
    expect(mockReplyCommentRepository.getRepliesByCommentId).toBeCalledWith('comment-1');
    expect(mockReplyCommentRepository.getRepliesByCommentId).toBeCalledWith('comment-2');
    expect(result).toMatchObject({
      id: threadId,
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      comments: [
        { 
          id: 'comment-1', 
          username: 'john', 
          content: 'hi',
          likeCount: 2,
          replies: [
            { id: 'reply-1', content: 'reply 1', username: 'johndoe' },
            { id: 'reply-2', content: '**balasan telah dihapus**', username: 'dicoding' },
          ],
        },
        { 
          id: 'comment-2', 
          username: 'doe', 
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });
  });
});


