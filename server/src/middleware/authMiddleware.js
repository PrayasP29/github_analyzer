import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (!req.headers.authorization) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Not authorized, token expired' });
    }
    res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
}
