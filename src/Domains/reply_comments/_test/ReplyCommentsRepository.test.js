const ReplyCommentsRepository = require('../ReplyCommentsRepository');

describe('ReplyCommentsRepository', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const replyCommentsRepository = new ReplyCommentsRepository();

    // Action and Assert
    await expect(replyCommentsRepository.addReplyComment({})).rejects.toThrowError('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyCommentsRepository.verifyReplyExists('')).rejects.toThrowError('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyCommentsRepository.verifyReplyOwner('', '')).rejects.toThrowError('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyCommentsRepository.deleteReplyComment('')).rejects.toThrowError('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyCommentsRepository.getRepliesByCommentId('')).rejects.toThrowError('REPLY_COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});