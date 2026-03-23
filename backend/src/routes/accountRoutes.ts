import express from 'express';
import jwt from 'jsonwebtoken';
import { AuthEnhancements } from '../middleware/authEnhancements';

const router = express.Router();

// Middleware to verify authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const cookieToken = req.cookies?.authToken;
  const authHeader = req.headers.authorization as string | undefined;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : undefined;
  const token = cookieToken || bearerToken;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId?: string;
      id?: string;
    };

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

// Get account details and authentication methods
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const accountData = await AuthEnhancements.getAccountData(req.userId);
    res.json(accountData);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch account data' });
  }
});

// Update password
router.put('/password', authenticateToken, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    const result = await AuthEnhancements.changePassword(req.userId, currentPassword, newPassword);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ 
        message: result.message,
        errors: result.errors 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Unlink Google account
router.delete('/google', authenticateToken, async (req: any, res) => {
  try {
    const result = await AuthEnhancements.unlinkGoogleAccount(req.userId);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink Google account' });
  }
});

export default router;
