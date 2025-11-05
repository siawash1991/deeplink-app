# 🚀 Deployment Guide

Complete guide for deploying Deep Link Shortener to various platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Heroku](#heroku)
  - [Vercel](#vercel)
  - [DigitalOcean](#digitalocean)
  - [AWS](#aws)
  - [Docker](#docker)
- [Database Setup](#database-setup)
- [Domain Configuration](#domain-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring](#monitoring)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 14+ installed
- ✅ MongoDB database (local or cloud)
- ✅ Git installed
- ✅ Domain name (optional but recommended)
- ✅ SSL certificate (for production)

---

## Environment Variables

Create a `.env` file with these variables:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Domain
DOMAIN=https://your-domain.com

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info
```

---

## Deployment Options

### 1. Heroku

Heroku is a Platform-as-a-Service (PaaS) that makes deployment simple.

#### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Add MongoDB Add-on**
   ```bash
   # Free tier MongoDB
   heroku addons:create mongolab:sandbox

   # Or use MongoDB Atlas (recommended)
   heroku config:set MONGODB_URI="mongodb+srv://..."
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DOMAIN=https://your-app-name.herokuapp.com
   heroku config:set JWT_SECRET=your-secret-here
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Open App**
   ```bash
   heroku open
   ```

8. **View Logs**
   ```bash
   heroku logs --tail
   ```

#### Heroku-Specific Files

**Procfile**:
```
web: npm start
```

**package.json** (engines):
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

---

### 2. Vercel

Vercel is great for serverless deployments.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add NODE_ENV
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

---

### 3. DigitalOcean

Deploy to a VPS for more control.

#### Steps:

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - At least 1GB RAM
   - Choose datacenter region

2. **SSH into Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Update System**
   ```bash
   apt update && apt upgrade -y
   ```

4. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   ```

5. **Install MongoDB**
   ```bash
   # Import MongoDB public key
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -

   # Add repository
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

   # Install
   apt update
   apt install -y mongodb-org

   # Start MongoDB
   systemctl start mongod
   systemctl enable mongod
   ```

6. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/deep-link-shortener.git
   cd deep-link-shortener
   ```

7. **Install Dependencies**
   ```bash
   npm install --production
   ```

8. **Setup Environment**
   ```bash
   cp .env.example .env
   nano .env
   # Edit with your values
   ```

9. **Install PM2**
   ```bash
   npm install -g pm2
   ```

10. **Start Application**
    ```bash
    pm2 start src/server.js --name deep-link-shortener
    pm2 startup
    pm2 save
    ```

11. **Setup Nginx**
    ```bash
    apt install -y nginx

    # Create Nginx config
    nano /etc/nginx/sites-available/deeplink
    ```

    **Nginx Configuration**:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

    ```bash
    # Enable site
    ln -s /etc/nginx/sites-available/deeplink /etc/nginx/sites-enabled/
    nginx -t
    systemctl restart nginx
    ```

12. **Setup Firewall**
    ```bash
    ufw allow 22
    ufw allow 80
    ufw allow 443
    ufw enable
    ```

13. **SSL with Let's Encrypt**
    ```bash
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d your-domain.com
    ```

---

### 4. AWS

Deploy to AWS EC2 or AWS Elastic Beanstalk.

#### EC2 Deployment

Similar to DigitalOcean steps above.

#### Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   eb init
   ```

3. **Create Environment**
   ```bash
   eb create production
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv MONGODB_URI=... NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

---

### 5. Docker

Deploy using Docker containers.

#### Dockerfile

Already created in the project root.

#### Docker Compose

Already created as `docker-compose.yml`.

#### Deployment Steps:

1. **Build Image**
   ```bash
   docker build -t deep-link-shortener .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e MONGODB_URI=... \
     -e NODE_ENV=production \
     --name deeplink \
     deep-link-shortener
   ```

3. **Or Use Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **View Logs**
   ```bash
   docker logs -f deeplink
   ```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region close to your users

3. **Create Database User**
   - Database Access → Add New User
   - Save username and password

4. **Whitelist IP**
   - Network Access → Add IP Address
   - For development: 0.0.0.0/0 (allow all)
   - For production: Add specific IPs

5. **Get Connection String**
   - Clusters → Connect → Connect Your Application
   - Copy connection string
   - Replace `<password>` with your password

6. **Set Environment Variable**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deeplink?retryWrites=true&w=majority
   ```

---

## Domain Configuration

### DNS Settings

Point your domain to your server:

**A Record**:
```
Type: A
Name: @
Value: your-server-ip
TTL: 3600
```

**CNAME for www**:
```
Type: CNAME
Name: www
Value: your-domain.com
TTL: 3600
```

---

## SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

### Cloudflare (Free SSL)

1. Add site to Cloudflare
2. Update nameservers
3. Enable SSL/TLS → Full
4. Enable Auto HTTPS Rewrites

---

## Monitoring

### PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs

# CPU/Memory
pm2 monit

# Restart
pm2 restart deep-link-shortener
```

### Health Checks

Use `/health` endpoint:

```bash
curl https://your-domain.com/health
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

---

## Performance Optimization

### 1. Enable Compression

Already included in `server.js`.

### 2. Use CDN

- Cloudflare
- AWS CloudFront
- Fastly

### 3. Database Indexing

Already configured in models.

### 4. Caching

Add Redis for frequently accessed links:

```bash
npm install redis
```

---

## Backup Strategy

### Database Backups

**MongoDB Atlas**:
- Automatic backups included
- Configure in dashboard

**Self-hosted MongoDB**:
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/deeplink-shortener" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/deeplink-shortener" /backups/20251105
```

### Automated Backups

**Cron Job**:
```bash
crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/bin/mongodump --uri="mongodb://..." --out=/backups/$(date +\%Y\%m\%d)
```

---

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **MongoDB Connection Failed**
   - Check connection string
   - Verify IP whitelist
   - Check firewall rules

3. **Environment Variables Not Loading**
   ```bash
   # Check if .env exists
   cat .env

   # Restart application
   pm2 restart deep-link-shortener
   ```

---

## Checklist

Before going live:

- [ ] Environment variables configured
- [ ] MongoDB database connected
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Error logging enabled
- [ ] Rate limiting tested
- [ ] Health check responding

---

## Support

Need help with deployment?
- 📧 Email: support@example.com
- 💬 Discord: [Join our server]
- 📖 Docs: [Full Documentation]
