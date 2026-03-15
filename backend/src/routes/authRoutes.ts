import express from 'express';
import { passport } from '../auth/google-auth';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const derivedName = name?.trim() || email.split('@')[0];
    const user = new User({
      email,
      password: hashedPassword,
      name: derivedName,
      isVerified: false,
    });

    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.password) {
      res.status(400).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Login failed' });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req: any, res) => {
    const { user, token } = req.user as { user: any, token: string };
    
    // Set secure HTTP-only cookie with token
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Redirect directly to dashboard, token is in secure cookie
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

// Get current user from auth cookie
router.get('/me', (req: any, res) => {
  try {
    const cookieToken = req.cookies?.authToken;
    const authHeader = req.headers.authorization as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;
    const token = cookieToken || bearerToken;

    if (!token) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId?: string;
      id?: string;
      email?: string;
    };

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    User.findById(userId)
      .select('_id email name avatar')
      .then((user) => {
        if (!user) {
          res.status(401).json({ message: 'User not found' });
          return;
        }

        res.json({
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        });
      })
      .catch(() => {
        res.status(401).json({ message: 'Invalid token' });
      });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
