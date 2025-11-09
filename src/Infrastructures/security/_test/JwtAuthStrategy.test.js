const JwtAuthStrategy = require('../JwtAuthStrategy');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('JwtAuthStrategy', () => {
  describe('scheme', () => {
    it('should throw AuthenticationError when authorization header is missing', async () => {
      // Arrange
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      const jwtAuthStrategy = new JwtAuthStrategy(mockAuthenticationTokenManager);
      const scheme = jwtAuthStrategy.scheme();

      const mockRequest = {
        headers: {},
      };
      const mockH = {
        authenticated: jest.fn(),
      };

      // Action & Assert
      await expect(scheme.authenticate(mockRequest, mockH)).rejects.toThrow('Missing authentication');
    });

    it('should throw AuthenticationError when authorization header does not start with Bearer', async () => {
      // Arrange
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      const jwtAuthStrategy = new JwtAuthStrategy(mockAuthenticationTokenManager);
      const scheme = jwtAuthStrategy.scheme();

      const mockRequest = {
        headers: {
          authorization: 'Basic xyz',
        },
      };
      const mockH = {
        authenticated: jest.fn(),
      };

      // Action & Assert
      await expect(scheme.authenticate(mockRequest, mockH)).rejects.toThrow('Missing authentication');
    });

    it('should throw AuthenticationError when token is invalid', async () => {
      // Arrange
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      mockAuthenticationTokenManager.verifyAccessToken = jest.fn().mockRejectedValue(new Error('token invalid'));
      
      const jwtAuthStrategy = new JwtAuthStrategy(mockAuthenticationTokenManager);
      const scheme = jwtAuthStrategy.scheme();

      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid_token',
        },
      };
      const mockH = {
        authenticated: jest.fn(),
      };

      // Action & Assert
      await expect(scheme.authenticate(mockRequest, mockH)).rejects.toThrow('Invalid token');
    });

    it('should authenticate successfully with valid token', async () => {
      // Arrange
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      mockAuthenticationTokenManager.verifyAccessToken = jest.fn().mockResolvedValue();
      mockAuthenticationTokenManager.decodePayload = jest.fn().mockResolvedValue({ id: 'user-123' });
      
      const jwtAuthStrategy = new JwtAuthStrategy(mockAuthenticationTokenManager);
      const scheme = jwtAuthStrategy.scheme();

      const mockRequest = {
        headers: {
          authorization: 'Bearer valid_token',
        },
      };
      const mockH = {
        authenticated: jest.fn().mockReturnValue('authenticated'),
      };

      // Action
      const result = await scheme.authenticate(mockRequest, mockH);

      // Assert
      expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith('valid_token');
      expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('valid_token');
      expect(mockH.authenticated).toBeCalledWith({
        credentials: { id: 'user-123' },
        artifacts: { token: 'valid_token' },
      });
      expect(result).toEqual('authenticated');
    });
  });
});
