// noinspection SqlNoDataSourceInspection
// SQL se izvršava samo u PGliteu.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
const userA = '00000000-0000-0000-0000-000000000001';
const userB = '00000000-0000-0000-0000-000000000002';
const gameA = '00000000-0000-0000-0000-000000000011';
const gameB = '00000000-0000-0000-0000-000000000012';
const groupA = '00000000-0000-0000-0000-000000000021';
const groupB = '00000000-0000-0000-0000-000000000022';
const fields = 'id title platform play_time genre publisher rating achievement_percent start_date end_date currently_playing game_api_id image_url background_image description metacritic_score esrb_rating release_date website_url developers genres_list platforms_list publishers_list screenshot_urls series_games status progress_mode progress_value progress_total progress_unit'.split(' ');
const numeric = ['play_time', 'rating', 'achievement_percent', 'metacritic_score', 'progress_value', 'progress_total'];
const columns = fields.map(field => `${field} ${field === 'id' ? 'uuid PRIMARY KEY' : numeric.includes(field) ? 'integer' : field === 'currently_playing' ? 'boolean' : 'text'}`).join(',');
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY, raw_user_meta_data jsonb, created_at timestamptz DEFAULT now());
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA auth TO authenticated;
CREATE TABLE public.games (${columns}, user_id uuid REFERENCES auth.users(id), notes text, created_at timestamptz DEFAULT now());
CREATE TABLE public.groups(id uuid PRIMARY KEY, user_id uuid, name text, type text, rating integer);
CREATE TABLE public.game_groups(id uuid PRIMARY KEY, user_id uuid, game_id uuid, group_id uuid);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.games TO anon, authenticated;
CREATE POLICY games_own ON public.games TO authenticated USING (auth.uid() = user_id);
INSERT INTO auth.users(id,raw_user_meta_data) VALUES ('${userA}', '{"name":"Igrač A","email":"private@example.test"}'), ('${userB}', '{"name":"Igrač B"}');
INSERT INTO games(id,user_id,title,notes,play_time,status,genre,rating) VALUES ('${gameA}','${userA}','Igra A','tajna',25,'completed','Action, RPG',5),('${gameB}','${userB}','Igra B','druga tajna',90,'playing','RPG',4);
INSERT INTO groups VALUES ('${groupA}','${userA}','Grupa A','collection',5), ('${groupB}','${userB}','Grupa B','collection',3);
INSERT INTO game_groups VALUES ('00000000-0000-0000-0000-000000000031','${userA}','${gameA}','${groupA}');`);
const before = (await db.query('SELECT * FROM games ORDER BY id')).rows;
const document = await readFile('Database.Md', 'utf8');
const schema = document.match(/```sql\n([\s\S]*?)```/)[1];
const statements = [
  ...schema.matchAll(/CREATE TABLE public\."library_shares" \([\s\S]*?\n\);/g),
  ...schema.matchAll(/ALTER TABLE (?:ONLY )?public\."library_shares"[\s\S]*?;/g),
  ...schema.matchAll(/CREATE POLICY [^;]+ ON public\."library_shares"[\s\S]*?;/g),
  ...schema.matchAll(/CREATE OR REPLACE FUNCTION public\.(?:get_public_library|save_library_share|check_library_username|save_library_username)\([\s\S]*?\n\$function\$;/g),
  ...schema.matchAll(/(?:GRANT|REVOKE)[^;]+(?:TABLE public\."library_shares"|FUNCTION public\."(?:get_public_library|save_library_share|check_library_username|save_library_username)")[^;]+;/g),
];
const migration = statements.map(match => match[0]).join('\n');
assert.match(migration, /get_public_library/);
assert.match(migration, /save_library_share/);
assert.doesNotMatch(migration, /\b(DROP|TRUNCATE|DELETE)\s+(TABLE|FROM)|ALTER TABLE public\.(games|groups|game_groups)\b/i);
await db.exec(migration);
async function role(name, id = '') { await db.exec(`RESET ROLE; SET request.jwt.claim.sub = '${id}'; SET ROLE ${name};`); }
async function rpc(username, section = 'header', options = {}) {
  return (await db.query('SELECT public.get_public_library($1,$2,$3::jsonb) AS data', [username, section, JSON.stringify(options)])).rows[0].data;
}
async function save(username, scope) { return db.query('SELECT public.save_library_share($1,$2)', [username, scope]); }
await role('anon');
await assert.rejects(db.query("SELECT public.check_library_username('player-a')"));
await assert.rejects(db.query("SELECT public.save_library_username('player-a')"));
await role('authenticated', userA);
await db.query("SELECT public.save_library_username('PLAYER-A')");
assert.equal((await db.query('SELECT share_scope FROM library_shares')).rows[0].share_scope, 'none');
assert.equal((await db.query("SELECT public.check_library_username('player-a') AS result")).rows[0].result.available, true);
await role('authenticated', userB);
assert.equal((await db.query("SELECT public.check_library_username('player-a') AS result")).rows[0].result.available, false);
assert.equal((await db.query("SELECT public.check_library_username('available-name') AS result")).rows[0].result.available, true);
assert.equal((await db.query("SELECT public.check_library_username('stats') AS result")).rows[0].result.available, false);
await assert.rejects(db.query("SELECT public.save_library_username('player-a')"));
await role('anon');
assert.equal(await rpc('player-a'), null);
await assert.rejects(save('player-a','all'));
await role('authenticated', userA);
await save('player-a','none');
assert.equal(await rpc('player-a'), null);
await save('player-a','library');
await db.query("SELECT public.save_library_username('player-a')");
assert.equal((await db.query('SELECT share_scope FROM library_shares')).rows[0].share_scope, 'library');

await role('anon');
const header = await rpc('player-a');
assert.equal(header.card.hours, 25);
assert.equal(header.card.total, 1);
assert.equal(header.username, 'player-a');
assert.doesNotMatch(JSON.stringify(header), /private@example|tajna|user_id/);
assert.equal(await rpc('player-a','stats'), null);
assert.equal((await rpc('player-a','games')).items.length, 1);
assert.equal((await rpc('player-a','games',{search:'missing'})).total, 0);
assert.equal((await rpc('player-a','games',{genre:'RPG'})).total, 1);
assert.equal((await rpc('player-a','games',{page:2})).items.length, 0);
assert.equal((await rpc('player-a','groups')).items[0].game_count, 1);
assert.equal(await rpc('player-a','game',{game:gameB}), null);
assert.equal(await rpc('player-a','games',{group:groupB}), null);
const detail = await rpc('player-a','game',{game:gameA});
assert.equal(detail.title, 'Igra A');
assert.equal((await rpc('player-a','game',{game:gameA,page:2})).title, 'Igra A');
assert.equal(detail.notes, undefined);
assert.equal(detail.created_at, undefined);
assert.deepEqual((await db.query('SELECT * FROM games')).rows, []);
await role('authenticated', userB);
assert.deepEqual((await db.query('SELECT * FROM library_shares')).rows, []);
await assert.rejects(save('player-a','all'));
for (const name of ['stats','UPPER SPACE','ab','bad.name']) await assert.rejects(save(name,'all'));
await save('player-b','all');
assert.equal((await rpc('player-b','stats')).items[0].created_at !== undefined, true);
assert.equal((await rpc('player-b','stats')).items[0].notes, undefined);
await role('authenticated', userA);
await db.query('SELECT public.save_library_username($1)', ['renamed-a']);
await save('player-a','all');
assert.equal(await rpc('player-a'), null);
assert.equal((await rpc('renamed-a','stats')).total, 1);
await save(null, 'library');
assert.equal((await rpc('renamed-a')).username, 'renamed-a');
assert.equal((await rpc('renamed-a','games',{search:'RPG'})).total, 1);
assert.equal((await rpc('renamed-a','games',{search:'%'})).total, 0);
await save('renamed-a','none');
assert.equal(await rpc('renamed-a'), null);
assert.equal(await rpc('renamed-a','stats'), null);
await db.exec('RESET ROLE');
assert.deepEqual((await db.query('SELECT * FROM games ORDER BY id')).rows, before);
await db.exec(`INSERT INTO public.games(id,user_id,title,rating,play_time) VALUES ('00000000-0000-0000-0000-000000000013','${userA}','Zadnja igra',2,0)`);
await role('authenticated', userA);
await save('renamed-a','all');
await role('anon');
assert.equal((await rpc('renamed-a','games',{sort:'title_desc'})).items[0].title, 'Zadnja igra');
assert.equal((await rpc('renamed-a','games',{sort:'rating_asc'})).items[0].rating, 2);
assert.equal((await rpc('renamed-a','games',{status:'rated-4'})).total, 1);
assert.equal((await rpc('renamed-a','games',{status:'rated-5'})).total, 1);
await db.exec('RESET ROLE');
await db.query('UPDATE games SET platform=$1,publisher=$2 WHERE id=$3', ['PlayStation 5', 'Studio A', gameA]);
await role('anon');
for (const search of ['PlayStation', 'Studio A', 'RPG']) {
  assert.equal((await rpc('renamed-a','games',{search})).total, 1);
  assert.equal((await rpc('renamed-a','games',{search,page:2})).items.length, 0);
}
await db.close();
console.log('SQL: scope, RLS, privatnost, username i očuvanje zapisa prolaze.');
