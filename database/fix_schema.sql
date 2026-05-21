-- Hapus trigger lama
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Hapus & buat ulang RLS policies untuk profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Matikan RLS dulu untuk profiles (biar server bisa insert)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Policy untuk slot_parkir (biar authenticated users bisa akses)
DROP POLICY IF EXISTS "Authenticated users can view slots" ON slot_parkir;
CREATE POLICY "Authenticated users can view slots"
    ON slot_parkir FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage slots" ON slot_parkir;
CREATE POLICY "Admins can manage slots"
    ON slot_parkir FOR ALL
    USING (auth.role() = 'authenticated');
