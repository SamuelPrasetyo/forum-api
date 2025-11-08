class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyCommentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyCommentRepository = replyCommentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    
    const mappedComments = await Promise.all(comments.map(async (c) => {
      const replies = await this._replyCommentRepository.getRepliesByCommentId(c.id);
      const mappedReplies = replies.map((r) => ({
        id: r.id,
        content: r.is_delete ? '**balasan telah dihapus**' : r.content,
        date: r.date,
        username: r.username,
      }));

      return {
        id: c.id,
        username: c.username,
        date: c.date,
        content: c.is_delete ? '**komentar telah dihapus**' : c.content,
        replies: mappedReplies,
      };
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


