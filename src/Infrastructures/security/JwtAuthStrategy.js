const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');

class JwtAuthStrategy {
  constructor(authenticationTokenManager) {
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async validate(artifacts, request, h) {
    try {
      const { token } = artifacts;
      await this._authenticationTokenManager.verifyAccessToken(token);
      const { id } = await this._authenticationTokenManager.decodePayload(token);
      
      return {
        isValid: true,
        credentials: {
          id,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        credentials: null,
      };
    }
  }

  scheme() {
    return {
      authenticate: async (request, h) => {
        const { authorization } = request.headers;

        if (!authorization || !authorization.startsWith('Bearer ')) {
          throw new AuthenticationError('Missing authentication');
        }

        const token = authorization.substring(7);

        try {
          await this._authenticationTokenManager.verifyAccessToken(token);
          const { id } = await this._authenticationTokenManager.decodePayload(token);

          return h.authenticated({
            credentials: { id },
            artifacts: { token },
          });
        } catch (error) {
          throw new AuthenticationError('Invalid token');
        }
      },
    };
  }
}

module.exports = JwtAuthStrategy;
