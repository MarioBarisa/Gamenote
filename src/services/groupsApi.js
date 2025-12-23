import { supabase } from '../supabase';

// Minimal groups API wrapper
// Tables expected:
// groups(id, user_id, name, type, rating, created_at)
// game_groups(id, user_id, game_id, group_id)

export async function listGroups(userId) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getGroup(groupId, userId) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function createGroup({ user_id, name, type, rating = null }) {
  const { data, error } = await supabase
    .from('groups')
    .insert([{ user_id, name, type: type || 'collection', rating }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGroup(groupId, userId, payload) {
  const { data, error } = await supabase
    .from('groups')
    .update(payload)
    .eq('id', groupId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGroup(groupId, userId) {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function listGroupGames(groupId, userId) {
  const { data, error } = await supabase
    .from('game_groups')
    .select('*, games:game_id(*)')
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function listGameGroups(gameId, userId) {
  const { data, error } = await supabase
    .from('game_groups')
    .select('*, groups:group_id(*)')
    .eq('game_id', gameId)
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function addGameToGroup({ user_id, group_id, game_id }) {
  const { data, error } = await supabase
    .from('game_groups')
    .insert([{ user_id, group_id, game_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeGameFromGroup({ user_id, group_id, game_id }) {
  const { error } = await supabase
    .from('game_groups')
    .delete()
    .eq('user_id', user_id)
    .eq('group_id', group_id)
    .eq('game_id', game_id);
  if (error) throw error;
}
