-- Dodavanje kolona za URL slike i artwork u games tablicu
-- Izvršiti ove naredbe u Supabase SQL editoru

-- 1. Dodaj kolonu image_url za čuvanje linkova slika igara
ALTER TABLE games ADD COLUMN image_url TEXT;

-- 2. Dodaj kolonu background_image kao alternativu za kompatibilnost s RAWG API-jem
ALTER TABLE games ADD COLUMN background_image TEXT;

-- 3. Dodaj kolonu updated_at ako je još nema (za praćenje ažuriranja)
-- Već postoji u SQL-u koji ste poslali, pa je možda već dodana
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Dodaj trigger da automatski ažurira updated_at kod izmjena
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Dodaj trigger na games tablicu
DROP TRIGGER IF EXISTS update_games_timestamp ON games;
CREATE TRIGGER update_games_timestamp
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
