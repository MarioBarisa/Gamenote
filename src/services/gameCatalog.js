import { supabase } from '../supabase'

/**
 * Finds or creates a game_catalog entry for the given RAWG game API ID.
 *
 * @param {string|number|null} gameApiId  — RAWG id (will be stringified)
 * @param {Object}             staticData — RAWG metadata fields for the catalog row
 * @returns {Promise<string|null>}        — UUID of the catalog entry, or null
 */
export async function getOrCreateCatalogEntry(gameApiId, staticData) {
  if (!gameApiId) return null

  const apiId = String(gameApiId)

  try {
    // 1. SELECT — does the entry already exist?
    const { data: existing, error: selectError } = await supabase
      .from('game_catalog')
      .select('id')
      .eq('game_api_id', apiId)
      .maybeSingle()

    if (selectError) {
      console.warn('[gameCatalog] SELECT error:', selectError.message)
      return null
    }

    if (existing) return existing.id

    // 2. INSERT — create a new catalog row
    const row = {
      game_api_id: apiId,
      title: staticData.title ?? null,
      description: staticData.description ?? null,
      background_image: staticData.background_image ?? null,
      release_date: staticData.release_date ?? null,
      metacritic_score: staticData.metacritic_score ?? null,
      esrb_rating: staticData.esrb_rating ?? null,
      website_url: staticData.website_url ?? null,
      genre: staticData.genre ?? null,
      publisher: staticData.publisher ?? null,
      developers: staticData.developers ?? null,
      genres_list: staticData.genres_list ?? null,
      platforms_list: staticData.platforms_list ?? null,
      publishers_list: staticData.publishers_list ?? null,
      screenshot_urls: staticData.screenshot_urls ?? null,
      series_games: staticData.series_games ?? null,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('game_catalog')
      .insert([row])
      .select('id')
      .single()

    if (!insertError && inserted) return inserted.id

    // 3. Race-condition fallback: unique violation (23505) means
    //    another user inserted the same game_api_id concurrently.
    if (insertError && insertError.code === '23505') {
      const { data: retry, error: retryError } = await supabase
        .from('game_catalog')
        .select('id')
        .eq('game_api_id', apiId)
        .maybeSingle()

      if (retryError) {
        console.warn('[gameCatalog] Retry SELECT error:', retryError.message)
        return null
      }

      return retry?.id ?? null
    }

    // 4. Any other INSERT error — log and return null (non-fatal)
    console.warn('[gameCatalog] INSERT error:', insertError.message)
    return null
  } catch (err) {
    console.warn('[gameCatalog] Unexpected error:', err)
    return null
  }
}
