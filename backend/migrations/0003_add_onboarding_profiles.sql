-- Migration: 0003_add_onboarding_profiles
-- Description: Table to store Zeyro B2B dashboard onboarding responses

CREATE TABLE onboarding_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zyid UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    stage VARCHAR(100),
    preset_answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_onboarding_profiles_zyid ON onboarding_profiles(zyid);
