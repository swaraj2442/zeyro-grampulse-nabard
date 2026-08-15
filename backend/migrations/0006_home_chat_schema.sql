CREATE TABLE home_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    completion_percentage INTEGER,
    hero_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE home_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    icon_type VARCHAR(50),
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE home_recommended_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    title VARCHAR(255) NOT NULL,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- 'user' or 'copilot'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Dummy Data for Sandbox Workspace
DO $$
DECLARE
    sandbox_id UUID;
BEGIN
    SELECT id INTO sandbox_id FROM workspaces WHERE name = 'Zeyro Sandbox' LIMIT 1;
    
    IF sandbox_id IS NOT NULL THEN
        -- Banner
        INSERT INTO home_banners (workspace_id, title, subtitle, completion_percentage, hero_image_url) 
        VALUES (sandbox_id, 'Production Readiness', 'Complete your sandbox integration to request production access.', 14, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=200');

        -- Tasks
        INSERT INTO home_tasks (workspace_id, title, description, duration_minutes, status, icon_type, display_order) VALUES
        (sandbox_id, 'Run your first assessment', 'Test an intelligence workflow using a preconfigured sample profile.', 5, 'pending', 'blue_circle', 1),
        (sandbox_id, 'Review your API credentials', 'Copy your sandbox API key and inspect the sample request.', 3, 'pending', 'orange_square', 2),
        (sandbox_id, 'Connect a data source', 'Upload sample data or configure an API-based integration.', 15, 'pending', 'gray_circle', 3);

        -- Recommended Steps
        INSERT INTO home_recommended_steps (workspace_id, title, display_order) VALUES
        (sandbox_id, 'Run a sample financial assessment', 1),
        (sandbox_id, 'Inspect the API request and response', 2),
        (sandbox_id, 'Upload your own test data', 3),
        (sandbox_id, 'Review contributing signals and reason codes', 4),
        (sandbox_id, 'Configure decision thresholds', 5),
        (sandbox_id, 'Invite a technical or risk teammate', 6),
        (sandbox_id, 'Add a webhook endpoint', 7),
        (sandbox_id, 'Request production access', 8);
    END IF;
END $$;
