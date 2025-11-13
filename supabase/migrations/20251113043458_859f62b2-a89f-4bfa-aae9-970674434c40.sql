-- Add category column to games table
ALTER TABLE public.games 
ADD COLUMN category TEXT DEFAULT 'Other';

-- Add index for better query performance
CREATE INDEX idx_games_category ON public.games(category);

-- Add some sample categories to existing games
UPDATE public.games 
SET category = 'MOBA' 
WHERE name IN ('Mobile Legends', 'League of Legends: Wild Rift', 'Arena of Valor');

UPDATE public.games 
SET category = 'Battle Royale' 
WHERE name IN ('PUBG Mobile', 'Free Fire', 'Call of Duty Mobile');

UPDATE public.games 
SET category = 'RPG' 
WHERE name IN ('Genshin Impact', 'Honkai: Star Rail', 'Tower of Fantasy');