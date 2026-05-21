import { supabaseAdmin } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }

      if (!roles.includes(profile.role)) {
        return res.status(403).json({ message: 'Anda tidak memiliki akses ke fitur ini' });
      }

      req.userProfile = profile;
      next();
    } catch (error) {
      console.error('Authorize error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
