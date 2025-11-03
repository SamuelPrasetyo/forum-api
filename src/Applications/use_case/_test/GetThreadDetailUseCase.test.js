const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate getting thread detail with comments', async () => {
    const threadId = 'thread-123';
    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({
        id: threadId,
        title: 'a title',
        body: 'a body',
        date: new Date('2021-08-08T07:19:09.775Z'),
        username: 'dicoding',
      }),
    };
    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn().mockResolvedValue([
        { id: 'comment-1', username: 'john', date: new Date('2021-08-08T07:22:33.555Z'), content: 'hi', is_delete: false },
        { id: 'comment-2', username: 'doe', date: new Date('2021-08-08T07:26:21.338Z'), content: 'bye', is_delete: true },
      ]),
    };

    const useCase = new GetThreadDetailUseCase({ threadRepository: mockThreadRepository, commentRepository: mockCommentRepository });
    const result = await useCase.execute(threadId);

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(result).toMatchObject({
      id: threadId,
      title: 'a title',
      body: 'a body',
      username: 'dicoding',
      comments: [
        { id: 'comment-1', username: 'john', content: 'hi' },
        { id: 'comment-2', username: 'doe', content: '**komentar telah dihapus**' },
      ],
    });
  });
});


