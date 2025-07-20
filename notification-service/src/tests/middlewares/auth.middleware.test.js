const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const { verifyToken, requireAuth, requireRole } = require('../../middlewares/auth.middleware');

describe('Authentication Middleware Tests', () => {
  let validToken;
  let adminToken;
  let userToken;

  beforeAll(() => {
    // Générer des tokens de test
    validToken = jwt.sign(
      { id: 'test-user-id', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: 'test-admin-id', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { id: 'test-user-id', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('Token Verification', () => {
    it('should verify valid token', () => {
      const req = {
        headers: {
          authorization: `Bearer ${validToken}`
        }
      };
      const res = {};
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('test-user-id');
      expect(req.user.role).toBe('user');
    });

    it('should reject invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should reject missing token', () => {
      const req = {
        headers: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should reject malformed authorization header', () => {
      const req = {
        headers: {
          authorization: 'invalid-format'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('Authentication Requirement', () => {
    it('should allow authenticated requests', () => {
      const req = {
        user: {
          id: 'test-user-id',
          role: 'user'
        }
      };
      const res = {};
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('Role Requirement', () => {
    it('should allow admin access', () => {
      const req = {
        user: {
          id: 'test-admin-id',
          role: 'admin'
        }
      };
      const res = {};
      const next = jest.fn();

      requireRole('admin')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject non-admin access', () => {
      const req = {
        user: {
          id: 'test-user-id',
          role: 'user'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireRole('admin')(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('should handle missing user role', () => {
      const req = {
        user: {
          id: 'test-user-id'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireRole('admin')(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('Integration Tests', () => {
    it('should allow authenticated access to protected route', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).not.toBe(401);
    });

    it('should reject unauthenticated access to protected route', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow admin access to admin route', async () => {
      const response = await request(app)
        .get('/api/admin/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });

    it('should reject non-admin access to admin route', async () => {
      const response = await request(app)
        .get('/api/admin/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Token Expiration', () => {
    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 'test-user-id', role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      // Attendre que le token expire
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Token Refresh', () => {
    it('should handle token refresh', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(validToken);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 