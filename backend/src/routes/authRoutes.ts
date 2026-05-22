import express from 'express';
import { passport } from '../auth/google-auth';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';
const jwt = require('jsonwebtoken');

const router = express.Router();

type GoogleOAuthState = {
  redirectUri?: string;
};

function normalizeOrigin(urlValue: string): string | null {
  try {
    return new URL(urlValue).origin;
  } catch {
    return null;
  }
}

const allowedFrontendOrigins = new Set(
  [...env.frontendOrigins, env.frontendUrl]
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin))
);

function isAllowedFrontendRedirect(urlValue: string): boolean {
  const origin = normalizeOrigin(urlValue);
  return Boolean(origin && allowedFrontendOrigins.has(origin));
}

function matchesRequestOrigin(urlValue: string, requestOrigin?: string): boolean {
  if (!requestOrigin) {
    return false;
  }

  const redirectOrigin = normalizeOrigin(urlValue);
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

  return Boolean(redirectOrigin && normalizedRequestOrigin && redirectOrigin === normalizedRequestOrigin);
}

function encodeOAuthState(state: GoogleOAuthState): string {
  return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
}

function decodeOAuthState(rawState?: string): GoogleOAuthState | null {
  if (!rawState) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf8')) as GoogleOAuthState;
    return parsed;
  } catch {
    return null;
  }
}

router.post('/register', async (req, res) => {
  try {
    let { email, password, name } = req.body as { email?: string; password?: string; name?: string };

    // ✅ ALWAYS trim and validate
    email = typeof email === 'string' ? email.trim() : '';
    password = typeof password === 'string' ? password.trim() : '';
    name = typeof name === 'string' ? name.trim() : '';

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    if (!email.includes('@') || email.length < 3) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const derivedName = name?.length > 0 ? name : email.split('@')[0];
    const user = new User({
      email,
      password: hashedPassword,
      name: derivedName,
      isVerified: false,
    });

    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body as { email?: string; password?: string };

    // ✅ ALWAYS trim and validate - defense in depth
    email = typeof email === 'string' ? email.trim() : '';
    password = typeof password === 'string' ? password.trim() : '';

    // Comprehensive validation
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    if (email.length < 3 || !email.includes('@')) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security: Generic message to prevent user enumeration
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.password) {
      // User exists but no password set - could be Google user or needs password setup
      if (user.googleId) {
        // Google user without password - offer to set up password
        res.status(422).json({ 
          message: 'This account uses Google Sign-In. Would you like to set a password to enable email login?',
          requiresPasswordSetup: true,
          email: user.email
        });
        return;
      } else {
        // Regular user without password (shouldn't happen but handle gracefully)
        res.status(400).json({ message: 'Account setup incomplete. Please contact support.' });
        return;
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Security: Generic message to prevent user enumeration
      res.status(401).json({ message: 'Invalid credentials' });
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
    // Security: Generic error message, no stack traces in production
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/google', (req, res, next) => {
  const redirectParam = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : undefined;
  const requestOriginHeader = req.get('origin') || undefined;
  const state: GoogleOAuthState = {};

  if (redirectParam && (isAllowedFrontendRedirect(redirectParam) || matchesRequestOrigin(redirectParam, requestOriginHeader))) {
    state.redirectUri = redirectParam;
  }

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: encodeOAuthState(state),
  })(req, res, next);
});

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
    const oauthState = decodeOAuthState(typeof req.query.state === 'string' ? req.query.state : undefined);
    const safeFrontendUrl = oauthState?.redirectUri && isAllowedFrontendRedirect(oauthState.redirectUri)
      ? oauthState.redirectUri
      : env.frontendUrl;

    res.redirect(new URL('/dashboard', safeFrontendUrl).toString());
  }
);

// Set password for existing account (especially for Google users)
router.post('/set-password', async (req, res) => {
  try {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId?: string;
      id?: string;
    };

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    let { password } = req.body as { password?: string };
    password = typeof password === 'string' ? password.trim() : '';

    if (!password) {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password set successfully. You can now use email login.' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid authentication token' });
      return;
    }
    res.status(500).json({ message: 'Failed to set password' });
  }
});

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
