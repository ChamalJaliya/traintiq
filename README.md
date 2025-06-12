# TraintiQ Frontend

A modern Angular application for AI-powered company profile generation with advanced scraping capabilities.

## Features

- 🤖 **AI-Powered Profile Generation**: Generate comprehensive company profiles using GPT-4
- 🌐 **Web Scraping**: Extract data from company websites automatically  
- 📊 **Interactive Dashboard**: Modern Material Design interface
- 🔧 **Customizable Templates**: Flexible profile generation with custom instructions
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 17+
- Backend API running (see backend README)

## Manual Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create or update `config.env`:
```env
# API Configuration
API_BASE_URL=http://localhost:5000/api
FRONTEND_PORT=4200

# Optional: Custom settings
ENABLE_DEBUG=true
```

### 3. Start Development Server
```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`

### 4. Build for Production
```bash
npm run build
# or
ng build --configuration production
```

## Docker Setup

### 1. Build Docker Image
```bash
docker build -t traintiq-frontend .
```

### 2. Run with Docker
```bash
docker run -p 4200:80 traintiq-frontend
```

### 3. Docker Compose (Recommended)
```bash
# Start entire system (frontend + backend)
docker-compose up -d

# Start only frontend
docker-compose up frontend
```

## Project Structure

```
src/
├── domains/           # Feature modules
│   └── company/       # Company profile features
├── shared/           # Shared components and services
├── core/             # Core application services
└── assets/           # Static assets
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run lint` - Run linting
- `npm run e2e` - Run end-to-end tests

## API Integration

The frontend communicates with the backend API for:
- Company profile generation
- Web scraping operations
- Template management
- Chat functionality

Ensure the backend is running before starting the frontend.

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify backend is running on correct port
   - Check `config.env` API_BASE_URL setting

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Update Angular CLI: `npm install -g @angular/cli@latest`

3. **Docker Issues**
   - Ensure Docker is running
   - Check port conflicts: `docker ps`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is proprietary software.
