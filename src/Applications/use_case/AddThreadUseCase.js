const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { title, body, owner } = new AddThread(useCasePayload);
    return await this._threadRepository.addThread({ title, body, owner });
  }
}

module.exports = AddThreadUseCase;
