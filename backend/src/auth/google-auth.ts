import '../config/loadEnv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const displayName = profile.displayName;
    const avatar = profile.photos?.[0]?.value;

    // Single optimized query: find by googleId OR email
    let user = await User.findOne({
      $or: [
        { googleId },
        { email }
      ]
    });
    
    if (user) {
      // Update existing user if googleId not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId,
        email,
        name: displayName,
        avatar,
        isVerified: true,
      });
      await user.save();
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    return done(null, { user, token });
  } catch (error) {
    return done(error as Error, false);
  }
}));

// Passport serialization for session management
passport.serializeUser((user: any, done) => {
  done(null, user.user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export { passport };
