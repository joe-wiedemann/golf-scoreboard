-- Create tables first
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    hole_pars JSON NOT NULL,
    total_par INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    players TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    hole_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO teams (name, password_hash, players) VALUES
('Team Alpha', '$2b$12$IuhIxoq1JFMmgvM9VCSa9.yxprOx652tNglZQHZagsXgaElRR/PB.', '["John Smith", "Jane Doe"]'),
('Team Beta', '$2b$12$IuhIxoq1JFMmgvM9VCSa9.yxprOx652tNglZQHZagsXgaElRR/PB.', '["Mike Johnson", "Sarah Wilson"]'),
('Team Gamma', '$2b$12$IuhIxoq1JFMmgvM9VCSa9.yxprOx652tNglZQHZagsXgaElRR/PB.', '["David Brown", "Lisa Davis"]'),
('Team Delta', '$2b$12$IuhIxoq1JFMmgvM9VCSa9.yxprOx652tNglZQHZagsXgaElRR/PB.', '["Tom Wilson", "Amy Johnson"]'),
('Team Echo', '$2b$12$IuhIxoq1JFMmgvM9VCSa9.yxprOx652tNglZQHZagsXgaElRR/PB.', '["Chris Lee", "Emma Taylor"]');

-- Insert Springdale Golf Club course configuration
INSERT INTO courses (name, hole_pars, total_par) VALUES (
    'Springdale Golf Club',
    '{"1": 4, "2": 4, "3": 5, "4": 3, "5": 4, "6": 3, "7": 4, "8": 4, "9": 4, "10": 4, "11": 3, "12": 5, "13": 3, "14": 4, "15": 4, "16": 4, "17": 5, "18": 5}',
    72
);