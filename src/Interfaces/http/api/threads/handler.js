const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    // Extract access token from Authorization header
    const { authorization } = request.headers;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new InvariantError('Missing authentication');
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
}

module.exports = ThreadsHandler;
