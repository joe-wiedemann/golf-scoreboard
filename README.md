# Real-Time Golf Scoreboard

A modern, real-time golf tournament scoreboard built with React, FastAPI, and PostgreSQL. Features course-aware scoring with relative-to-par display and live leaderboard updates.

## Features

- 🏌️ **Course-Aware Scoring**: Displays scores relative to par (E, +2, -1)
- 📊 **Real-Time Leaderboard**: Live updates as teams submit scores
- 📱 **Mobile-Friendly**: Responsive design works on all devices
- 🔐 **Team Authentication**: Secure login for each team
- 🎯 **Detailed Scorecards**: Click teams to see hole-by-hole breakdown
- ⛳ **Course Configuration**: Easy setup for different golf courses

## Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Deployment**: Docker + Docker Compose
- **Authentication**: JWT tokens with bcrypt password hashing

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/golf-scoreboard.git
   cd golf-scoreboard
   ```

2. **Start the application**
   ```bash
   sudo docker compose up --build -d
   ```

3. **Access the application in Local Development**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Default Login Credentials

Review generating new passwords to establish default password. All credientials created by administrator.

- Team Alpha: John Smith, Jane Doe
- Team Beta: Mike Johnson, Sarah Wilson
- Team Gamma: David Brown, Lisa Davis
- Team Delta: Tom Wilson, Amy Johnson
- Team Echo: Chris Lee, Emma Taylor

## Configuration

### Changing Course Information

Edit `database/init/01-init.sql`:

```sql
INSERT INTO courses (name, hole_pars, total_par) VALUES (
    'Your Golf Course',
    '{"1": 4, "2": 4, "3": 5, ...}',  -- Hole-by-hole par values
    72  -- Total course par
);
```

### Adding/Modifying Teams

Edit `database/init/01-init.sql`:

```sql
INSERT INTO teams (name, password_hash, players) VALUES
('Team Name', 'bcrypt_hash_here', '["Player 1", "Player 2"]');
```

### Generating New Passwords

Generate hash and update `database/01-init.sql` with hash
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw('new_password'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))"
```

### Reset All Scores

```bash
./reset_scores.sh
```

## Development

### Project Structure
```
golfscoreboard/
├── frontend/          # React application
├── backend/           # FastAPI application
├── database/          # Database initialization
├── nginx/            # Reverse proxy configuration
├── docker-compose.yml # Development environment
└── docker-compose.prod.yml # Production environment
```

### Local Development

1. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Development**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

## Deployment

### Digital Ocean (Recommended)

1. **Create a Droplet**
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum
   - Docker pre-installed

2. **Deploy**
   ```bash
   git clone <your-repo>
   cd golf-scoreboard
   sudo docker compose -f docker-compose.prod.yml up -d
   ```

3. **Configure Domain**
   - Point your domain to the droplet's IP
   - Update nginx configuration if needed

## API Endpoints

- `GET /courses/leaderboard` - Get leaderboard with relative-to-par scores
- `GET /courses/current` - Get current course information
- `POST /auth/login` - Team login
- `POST /scores` - Submit a score
- `GET /courses/team/{id}/scorecard` - Get team's detailed scorecard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub. 
