const AddComment = require('../AddComment');

describe('AddComment entity', () => {
  it('should throw error when payload missing property', () => {
    expect(() => new AddComment({ content: 'a', owner: 'user-1' })).toThrow('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has invalid types', () => {
    expect(() => new AddComment({ content: 123, owner: 'user-1', threadId: 'thread-1' })).toThrow('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment correctly', () => {
    const payload = { content: 'a', owner: 'user-1', threadId: 'thread-1' };
    const entity = new AddComment(payload);
    expect(entity.content).toEqual('a');
    expect(entity.owner).toEqual('user-1');
    expect(entity.threadId).toEqual('thread-1');
  });
});


