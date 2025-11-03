class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const mappedComments = comments.map((c) => ({
      id: c.id,
      username: c.username,
      date: c.date,
      content: c.is_delete ? '**komentar telah dihapus**' : c.content,
    }));
    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: mappedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;


