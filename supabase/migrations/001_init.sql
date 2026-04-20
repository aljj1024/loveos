-- LoveOS Phase 1: Initial Schema

-- 1. couples（情侣对）
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id),
  user2_id UUID REFERENCES auth.users(id),
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. couple_state（共享状态）
CREATE TABLE couple_state (
  couple_id UUID PRIMARY KEY REFERENCES couples(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 998,
  wiki_profiles JSONB DEFAULT '[]',
  wife_mood JSONB,
  husband_mood JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📋',
  reward INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  accepted_by TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  source_approval_id TEXT
);

-- 4. approvals
CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  template TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT,
  datetime TEXT,
  sincerity TEXT,
  submitted_at TIMESTAMPTZ NOT NULL,
  submitted_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_at TIMESTAMPTZ,
  condition_text TEXT,
  condition_task_id TEXT,
  points_deducted INTEGER
);

-- 5. store_items
CREATE TABLE store_items (
  id TEXT PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cost INTEGER NOT NULL,
  icon TEXT,
  color_class TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by TEXT
);

-- 6. vouchers
CREATE TABLE vouchers (
  id TEXT PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  item_id TEXT,
  item_title TEXT,
  item_icon TEXT,
  purchased_at TIMESTAMPTZ NOT NULL,
  purchased_by TEXT,
  is_redeemed BOOLEAN DEFAULT FALSE,
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ
);

-- 7. ledger_entries
CREATE TABLE ledger_entries (
  id TEXT PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  related_id TEXT
);

-- 8. wishlist_items
CREATE TABLE wishlist_items (
  id TEXT PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🎁',
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL,
  added_by TEXT,
  claimed_by TEXT,
  claimed_at TIMESTAMPTZ
);

-- =====================
-- RLS: Row Level Security
-- =====================

CREATE OR REPLACE FUNCTION get_my_couple_id()
RETURNS UUID AS $$
  SELECT id FROM couples
  WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- couples
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON couples
  USING (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "allow insert own couple" ON couples
  FOR INSERT WITH CHECK (user1_id = auth.uid());
CREATE POLICY "allow update own couple" ON couples
  FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- couple_state
ALTER TABLE couple_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON couple_state
  USING (couple_id = get_my_couple_id());
CREATE POLICY "allow insert" ON couple_state
  FOR INSERT WITH CHECK (couple_id = get_my_couple_id());
CREATE POLICY "allow update" ON couple_state
  FOR UPDATE USING (couple_id = get_my_couple_id());

-- tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON tasks
  USING (couple_id = get_my_couple_id());
CREATE POLICY "allow insert" ON tasks
  FOR INSERT WITH CHECK (couple_id = get_my_couple_id());
CREATE POLICY "allow update" ON tasks
  FOR UPDATE USING (couple_id = get_my_couple_id());
CREATE POLICY "allow delete" ON tasks
  FOR DELETE USING (couple_id = get_my_couple_id());

-- approvals
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON approvals
  USING (couple_id = get_my_couple_id());
CREATE POLICY "allow insert" ON approvals
  FOR INSERT WITH CHECK (couple_id = get_my_couple_id());
CREATE POLICY "allow update" ON approvals
  FOR UPDATE USING (couple_id = get_my_couple_id());

-- store_items
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON store_items
  USING (couple_id = get_my_couple_id());
CREATE POLICY "allow insert" ON store_items
  FOR INSERT WITH CHECK (couple_id = get_my_couple_id());
CREATE POLICY "allow update" ON store_items
  FOR UPDATE USING (couple_id = get_my_couple_id());
CREATE POLICY "allow delete" ON store_items
  FOR DELETE USING (couple_id = get_my_couple_id());

-- vouchers
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON vouchers
  USING (couple_id = get_my_couple_id());
CREATE POLICY "allow insert" ON vouchers
  FOR INSERT WITH CHECK (couple_id = get_my_couple_id());
CREATE POLICY "allow update" ON vouchers
  FOR UPDATE USING (couple_id = get_my_couple_id());

-- ledger_entries
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON ledger_entries
  USING (couple_id = get_my_couple_id());
CREATE POLICY "allow insert" ON ledger_entries
  FOR INSERT WITH CHECK (couple_id = get_my_couple_id());

-- wishlist_items
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couple members only" ON wishlist_items
  USING (couple_id = get_my_couple_id());
CREATE POLICY "allow insert" ON wishlist_items
  FOR INSERT WITH CHECK (couple_id = get_my_couple_id());
CREATE POLICY "allow update" ON wishlist_items
  FOR UPDATE USING (couple_id = get_my_couple_id());
CREATE POLICY "allow delete" ON wishlist_items
  FOR DELETE USING (couple_id = get_my_couple_id());

-- =====================
-- Realtime
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE couple_state;
ALTER PUBLICATION supabase_realtime ADD TABLE vouchers;
ALTER PUBLICATION supabase_realtime ADD TABLE store_items;
ALTER PUBLICATION supabase_realtime ADD TABLE ledger_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_items;
