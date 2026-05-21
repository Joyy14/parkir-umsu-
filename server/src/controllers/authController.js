import { supabase, supabaseAdmin } from '../config/supabase.js';

export const register = async (req, res) => {
  try {
    const { email, password, nama_lengkap, nip_npm, no_hp, role } = req.body;

    if (!email || !password || !nama_lengkap) {
      return res.status(400).json({ message: 'Email, password, dan nama lengkap harus diisi' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          nama_lengkap,
          nip_npm: nip_npm || null,
          no_hp: no_hp || null,
          role: role || 'user',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: authData.user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login berhasil',
      session: data.session,
      user: {
        ...data.user,
        profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Profile tidak ditemukan' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { nama_lengkap, nip_npm, no_hp, foto_url } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        nama_lengkap,
        nip_npm,
        no_hp,
        foto_url,
        updated_at: new Date(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Profile berhasil diupdate', profile: data });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email harus diisi' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Link reset password telah dikirim ke email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: parkir, error, count } = await supabase
      .from('transaksi_parkir')
      .select('*, slot_parkir(kode_slot, lokasi)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('waktu_masuk', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      data: parkir,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get my history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
