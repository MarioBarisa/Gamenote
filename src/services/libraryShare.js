import { supabase } from '../supabase.js';

export async function loadShareSettings(userId) {
  const { data, error } = await supabase.from('library_shares').select('username,share_scope').eq('user_id', userId).maybeSingle();
  if (error) throw new Error('Postavke dijeljenja nije moguće učitati. Pokušaj ponovno.');
  return data || { username: '', share_scope: 'none' };
}

export async function saveShareSettings(username, scope) {
  const { data, error } = await supabase.rpc('save_library_share', { p_username: username, p_scope: scope });
  if (error?.code === '23505') throw new Error('Ovo korisničko ime je zauzeto. Odaberi drugo.');
  if (error) throw new Error('Postavke nisu spremljene. Provjeri korisničko ime i pokušaj ponovno.');
  return data;
}

export async function loadPublicLibrary(username, section = 'header', options = {}, signal) {
  let request = supabase.rpc('get_public_library', { p_username: username, p_section: section, p_options: options });
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw new Error('Zbirku nije moguće učitati. Pokušaj ponovno.');
  if (!data) throw new Error('Zbirka nije dostupna.');
  return data;
}

export async function checkUsernameAvailability(username) {
  const { data, error } = await supabase.rpc('check_library_username', { p_username: username });
  if (error) throw new Error('Dostupnost imena nije moguće provjeriti. Pokušaj ponovno.');
  return data.available === true;
}

export async function saveLibraryUsername(username) {
  const { data, error } = await supabase.rpc('save_library_username', { p_username: username });
  if (error?.code === '23505') throw new Error('Ovo korisničko ime je zauzeto. Odaberi drugo.');
  if (error) throw new Error('Korisničko ime nije spremljeno. Pokušaj ponovno.');
  return data;
}
