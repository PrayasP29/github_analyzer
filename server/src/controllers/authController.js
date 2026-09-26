import bcrypt from 'bcryptjs';
import User, { EMAIL_PATTERN } from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Hash of a random 32-byte throwaway nobody knows, cost 10 to match the model.
// Compared against when the email is unknown so both 401 paths cost the same
// bcrypt work and cannot be told apart by timing. Regenerate with:
// node -e "console.log(require('bcryptjs').hashSync(require('crypto').randomBytes(32).toString('base64url'), 10))"
const DUMMY_HASH = '$2b$10$gFqtPnILDeWmr.b7OX2i7eHVR87tkaz02a0L6qYjJoez4S403eIi.';

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
    const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

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
