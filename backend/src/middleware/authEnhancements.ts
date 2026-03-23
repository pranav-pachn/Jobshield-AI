import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// Enhanced authentication utilities
export class AuthEnhancements {
  
  // Calculate security level based on authentication methods
  static calculateSecurityLevel(user: any): 'low' | 'medium' | 'high' {
    const hasPassword = !!user.password;
    const hasGoogle = !!user.googleId;
    
    if (hasPassword && hasGoogle) {
      return 'high';
    } else if (hasPassword || hasGoogle) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Validate password strength
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Safely unlink Google account
  static async unlinkGoogleAccount(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      if (!user.googleId) {
        return { success: false, message: 'No Google account linked' };
      }
      
      if (!user.password) {
        return { 
          success: false, 
          message: 'Cannot unlink Google account without a password. Please set a password first.' 
        };
      }
      
      // Remove Google ID
      user.googleId = undefined;
      await user.save();
      
      return { success: true, message: 'Google account unlinked successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to unlink Google account' };
    }
  }

  // Enhanced password change with security checks
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      if (!user.password) {
        return { success: false, message: 'No password set for this account' };
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          message: 'New password does not meet security requirements',
          errors: passwordValidation.errors
        };
      }
      
      // Check if new password is the same as current
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return { success: false, message: 'New password must be different from current password' };
      }
      
      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to update password' };
    }
  }

  // Get comprehensive account data
  static async getAccountData(userId: string) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        hasPassword: !!user.password,
        hasGoogleAuth: !!user.googleId,
        googleId: user.googleId,
        createdAt: user.createdAt,
        lastPasswordChange: user.updatedAt,
        securityLevel: this.calculateSecurityLevel(user),
      };
    } catch (error) {
      throw new Error('Failed to fetch account data');
    }
  }
}
