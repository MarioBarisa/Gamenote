import { t } from '../i18n/index.js';
import { supabase } from '../supabase.js';

export async function loadShareSettings(userId, signal) {
  let request = supabase.from('library_shares').select('username,share_scope').eq('user_id', userId).maybeSingle();
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw new Error(t('libraryShare.sharingSettingsCouldntBeLoaded'));
  return data || { username: '', share_scope: 'none' };
}

export async function saveShareSettings(username, scope) {
  const { data, error } = await supabase.rpc('save_library_share', { p_username: username, p_scope: scope });
  if (error?.code === '23505') throw new Error(t('libraryShare.thisUsernameIsTakenChoose'));
  if (error) throw new Error(t('libraryShare.settingsWerentSavedCheckYour'));
  return data;
}

export async function loadPublicLibrary(username, section = 'header', options = {}, signal) {
  let request = supabase.rpc('get_public_library', { p_username: username, p_section: section, p_options: options });
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw new Error(t('libraryShare.theLibraryCouldntBeLoaded'));
  if (!data) throw new Error(t('libraryShare.theLibraryIsUnavailable'));
  return data;
}

export async function checkUsernameAvailability(username) {
  const { data, error } = await supabase.rpc('check_library_username', { p_username: username });
  if (error) throw new Error(t('libraryShare.couldntCheckWhetherTheUsername'));
  return data.available === true;
}

export async function saveLibraryUsername(username) {
  const { data, error } = await supabase.rpc('save_library_username', { p_username: username });
  if (error?.code === '23505') throw new Error(t('libraryShare.thisUsernameIsTakenChoose'));
  if (error) throw new Error(t('libraryShare.theUsernameWasntSavedTry'));
  return data;
}
