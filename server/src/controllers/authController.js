import bcrypt from 'bcryptjs';
import User, { EMAIL_PATTERN } from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ponytail: no dummy compare on a miss, so a bad email returns measurably faster than a wrong password.
// Add a constant-time bcrypt.compare against a fixed hash if login timing ever needs to be indistinguishable.
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

export async function registerUser(req, res) {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message,
      });
    }
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  if (!password) return res.status(400).json({ success: false, message: 'Password is required' });
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const passwordMatches = user && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export function getMe(req, res) {
  res.status(200).json({ success: true, user: publicUser(req.user) });
}
