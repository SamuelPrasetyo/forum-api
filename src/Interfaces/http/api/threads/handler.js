const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager');
const AuthenticationError = require('../../../../Commons/exceptions/AuthenticationError');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    // Extract access token from Authorization header
    const { authorization } = request.headers;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = authorization.substring(7); // Remove 'Bearer ' prefix
    const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
    
    // Verify and decode token
    await authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await authenticationTokenManager.decodePayload(token);

    // Execute use case
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadDetailHandler(request) {
    const { threadId } = request.params;
    const GetThreadDetailUseCase = require('../../../../Applications/use_case/GetThreadDetailUseCase');
    const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
    const thread = await getThreadDetailUseCase.execute(threadId);
    return {
      status: 'success',
      data: { thread },
    };
  }

}

module.exports = ThreadsHandler;
