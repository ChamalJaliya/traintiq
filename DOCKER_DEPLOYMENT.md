# 🐳 TraintiQ Docker Deployment Guide

This guide will help you deploy the complete TraintiQ system using Docker containers.

## 📋 Prerequisites

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
2. **Docker Compose** (usually included with Docker Desktop)
3. **Git** (to clone the repository)
4. **8GB+ RAM** recommended for all services

## 🚀 Quick Start

### 1. Install Docker Desktop

**For Windows:**
- Download from: https://www.docker.com/products/docker-desktop/
- Run the installer and restart your computer
- Launch Docker Desktop from Start menu

**For Mac:**
- Download from: https://www.docker.com/products/docker-desktop/
- Drag to Applications folder and launch

**For Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Deploy TraintiQ

```batch
# Windows
./deploy-docker.bat

# Or run individual commands:
docker-compose --env-file docker.env up --build -d
```

## 🏗️ Architecture Overview

The Docker deployment includes these services:

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 80 | Angular application with Nginx |
| **Backend** | 5000 | Flask API server |
| **MySQL** | 3306 | Primary database |
| **Redis** | 6379 | Cache and session storage |
| **Nginx** | 8080 | Load balancer |
| **Prometheus** | 9090 | Metrics collection |
| **Grafana** | 3000 | Monitoring dashboard |

## 🔧 Configuration

### Environment Variables

Edit `docker.env` to configure your deployment:

```env
# Database
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=traintiq_db
MYSQL_USER=traintiq_user
MYSQL_PASSWORD=traintiq_password

# OpenAI (Optional)
OPENAI_API_KEY=your_api_key_here

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### Custom Configuration

1. **Database Settings**: Modify `docker-compose.yml` MySQL section
2. **Nginx Config**: Edit `nginx.conf` for custom routing
3. **SSL/HTTPS**: Add certificates to `ssl/` directory
4. **Monitoring**: Configure `monitoring/prometheus.yml`

## 📦 Service Details

### Frontend (Angular + Nginx)
- **Built from**: `traintiq/Dockerfile`
- **Serves**: Production Angular build
- **Config**: Uses `nginx.conf` for routing

### Backend (Flask + Gunicorn)
- **Built from**: `traintiq_scrapping_backend/Dockerfile`
- **Features**: REST API, WebSocket support
- **Health Check**: `/health` endpoint

### Database (MySQL 8.0)
- **Initialization**: Runs `init-scripts/01-init-database.sql`
- **Persistence**: Data stored in `mysql_data` volume
- **Backup**: Auto-configured backups

### Cache (Redis)
- **Usage**: Session storage, API caching
- **Persistence**: RDB snapshots enabled
- **Memory**: 256MB default limit

## 🔨 Management Commands

Use `docker-manage.bat` for easy management:

```batch
# Start all services
docker-manage.bat start

# View logs
docker-manage.bat logs
docker-manage.bat logs backend

# Check status
docker-manage.bat status

# Stop services
docker-manage.bat stop

# Restart services
docker-manage.bat restart

# Clean up everything
docker-manage.bat clean

# Rebuild and restart
docker-manage.bat rebuild

# Access service shell
docker-manage.bat shell backend
```

## 🔍 Monitoring & Debugging

### Service Health Checks

```batch
# Check all services
docker-compose ps

# View service logs
docker-compose logs -f [service_name]

# Execute commands in containers
docker-compose exec backend /bin/bash
docker-compose exec mysql mysql -u root -p
```

### Monitoring Dashboards

1. **Grafana**: http://localhost:3000
   - Username: `admin`
   - Password: `admin`

2. **Prometheus**: http://localhost:9090
   - View metrics and targets

### Database Access

```bash
# MySQL CLI
docker-compose exec mysql mysql -u traintiq_user -p traintiq_db

# Redis CLI
docker-compose exec redis redis-cli
```

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Passwords**:
   ```env
   MYSQL_ROOT_PASSWORD=strong_password_here
   MYSQL_PASSWORD=user_password_here
   GF_SECURITY_ADMIN_PASSWORD=grafana_password_here
   ```

2. **Use SSL/HTTPS**:
   - Add certificates to `ssl/` directory
   - Update `nginx.conf` for HTTPS
   - Configure ports 443/8443

3. **Firewall Configuration**:
   - Only expose necessary ports (80, 443)
   - Restrict database access (3306)
   - Use internal Docker network

4. **Environment Variables**:
   - Use Docker secrets for sensitive data
   - Don't commit `.env` files to version control

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Change ports in docker-compose.yml
   ports:
     - "8080:80"  # Changed from 80:80
   ```

2. **Out of Memory**:
   ```bash
   # Increase Docker memory limit in Docker Desktop settings
   # Or disable some services in docker-compose.yml
   ```

3. **Database Connection Failed**:
   ```bash
   # Check MySQL logs
   docker-compose logs mysql
   
   # Verify credentials in docker.env
   # Wait for health check to pass
   ```

4. **Frontend Build Failed**:
   ```bash
   # Check Node.js version in Dockerfile
   # Clear build cache
   docker-compose build --no-cache frontend
   ```

### Performance Optimization

1. **Resource Limits**:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
       reservations:
         memory: 256M
   ```

2. **Database Tuning**:
   ```yaml
   command: --innodb-buffer-pool-size=128M --max-connections=50
   ```

3. **Redis Configuration**:
   ```yaml
   command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
   ```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [TraintiQ Architecture Guide](./ARCHITECTURE_SUMMARY.md)
- [API Documentation](./API_DOCS.md)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-manage.bat logs`
2. Verify configuration: `docker-manage.bat status`
3. Review this guide for troubleshooting steps
4. Check Docker Desktop resources and settings

---

**🎉 Once deployed, access TraintiQ at:** http://localhost:80 