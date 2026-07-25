-- Create gear_items table
CREATE TABLE IF NOT EXISTS gear_items (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    condition INTEGER NOT NULL,
    assigned_to TEXT,
    current_project TEXT,
    return_date TEXT,
    image TEXT,
    serial_number TEXT,
    last_maintenance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    status_color TEXT,
    accent_color TEXT,
    projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    skills JSONB DEFAULT '[]'::jsonb,
    current_project TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    joined TEXT,
    avatar TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_current_user BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create finance_state table
CREATE TABLE IF NOT EXISTS finance_state (
    id TEXT PRIMARY KEY,
    state_blob JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_state ENABLE ROW LEVEL SECURITY;

-- Create policies for gear_items
CREATE POLICY "Enable all access for authenticated users on gear_items"
    ON gear_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policies for team_members
CREATE POLICY "Enable all access for authenticated users on team_members"
    ON team_members FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policies for chat_messages
CREATE POLICY "Enable all access for authenticated users on chat_messages"
    ON chat_messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policies for finance_state
CREATE POLICY "Enable all access for authenticated users on finance_state"
    ON finance_state FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Enable Realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE gear_items;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE finance_state;
