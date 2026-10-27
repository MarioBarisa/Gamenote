export const userId = '11111111-1111-1111-1111-111111111111';
export const steamId = '76561198000000001';

// Novi izvor dodaje se ovom popisu.
export const importers = [
  {
    id: 'steam', tab: 'Steam', connectButton: 'Poveži Steam račun',
    newName: 'Nova Steam igra', existingName: 'Postojeća Steam igra',
    newKey: '220', existingKey: '620',
    game: { appId: 220, name: 'Nova Steam igra', minutesPlayed: 125, imageUrl: null },
    unavailableGame: { appId: 220, minutesPlayed: null },
  },
  {
    id: 'psn', tab: 'PlayStation', connectButton: 'Poveži PSN račun',
    newName: 'Nova PSN igra', existingName: 'Postojeća PSN igra',
    newKey: 'CUSA00001', existingKey: 'CUSA00002',
    game: { psnTitleId: 'CUSA00001', npCommunicationId: 'NPWR00001', name: 'Nova PSN igra', platformCategory: 'ps4_game', hoursPlayed: 2.1, trophiesEarned: 1, trophiesTotal: 4, trophyPercent: 25 },
    unavailableGame: { psnTitleId: 'CUSA00001', hoursPlayed: null, trophiesEarned: null, trophiesTotal: null },
  },
];

export function existingRow(provider) {
  return {
    id: 'existing-game', user_id: userId, title: provider.existingName,
    platform: provider.id === 'steam' ? 'PC' : 'PlayStation 4',
    website_url: provider.id === 'steam' ? 'https://store.steampowered.com/app/620/' : null,
    psn_title_id: provider.id === 'psn' ? 'CUSA00002' : null,
    psn_np_communication_id: provider.id === 'psn' ? 'NPWR00002' : null,
    notes: 'Sačuvaj bilješku', rating: 5, status: 'paused',
    achievement_percent: 75, progress_value: 3, progress_total: 4, play_time: 9,
  };
}

export function catalogGame(provider, title = provider.newName) {
  return {
    id: 'catalog-' + provider.id + (title === provider.existingName ? '-existing' : ''), name: title,
    background_image: 'https://images.importers.test/catalog-cover.jpg',
    description_raw: 'Opis iz Gamenote kataloga', released: '2020-01-01',
    metacritic: 88, esrb_rating: { name: 'Teen' }, website: 'https://example.test/game',
    genres: [{ name: 'Puzzle' }], developers: [{ name: 'Studio' }],
    publishers: [{ name: 'Izdavač' }], platforms: [{ platform: { name: 'PC' } }],
  };
}

export function sourcePoster(provider, key = provider.newKey) {
  if (provider.id === 'steam') return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${key}/library_600x900.jpg`;
  return 'https://images.importers.test/cover.svg';
}
