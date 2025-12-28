# Green && Blue Blog - Deployment Guide

## Deployment Methods

### Option 1: VPS / Cloud Server Deployment (Recommended)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux
- Docker & Docker Compose installed
- Domain name (optional but recommended)
- SSH access to server

#### Steps

1. **Connect to server via SSH:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker & Docker Compose:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone project:**
   ```bash
   git clone https://github.com/yourusername/DoAnLapTrinhBlog.git
   cd DoAnLapTrinhBlog
   ```

4. **Create production environment file:**
   ```bash
   cat > backend/.env << EOF
   DB_HOST=db
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=change_me_to_strong_password
   DB_NAME=blog_db
   PORT=4000
   JWT_SECRET=change_me_to_random_secret_key_min_32_chars
   ADMIN_PASSWORD=change_me_to_strong_admin_password
   FRONTEND_URL=https://yourdomain.com
   COOKIE_SECURE=true
   NODE_ENV=production
   EOF
   ```

5. **Build and start services:**
   ```bash
   # Using production compose file
   sudo docker compose -f docker-compose.prod.yml up -d --build
   
   # Or using regular docker-compose (production env vars will be used)
   sudo docker compose up -d --build
   ```

6. **Verify services are running:**
   ```bash
   sudo docker compose ps
   ```

7. **Check logs:**
   ```bash
   sudo docker compose logs -f backend
   ```

#### HTTPS Setup (Let's Encrypt)

1. **Install Certbot:**
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Update nginx config for SSL:**
   ```bash
   # Edit nginx/default.conf to include SSL directives
   # Or use the SSL certificate paths:
   #   /etc/letsencrypt/live/yourdomain.com/fullchain.pem
   #   /etc/letsencrypt/live/yourdomain.com/privkey.pem
   ```

3. **Generate certificate:**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

4. **Update nginx config to use certificate:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # ... rest of config
   }
   
   # Redirect HTTP to HTTPS
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

5. **Reload nginx:**
   ```bash
   sudo docker compose exec nginx nginx -s reload
   ```

6. **Auto-renewal (cron job):**
   ```bash
   sudo crontab -e
   # Add: 0 3 * * * certbot renew --quiet && docker compose exec nginx nginx -s reload
   ```

---

### Option 2: Heroku Deployment

#### Prerequisites
- Heroku account
- Heroku CLI installed
- ClearDB (free MySQL) or provision separately

#### Steps

1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Add MySQL add-on (or use external DB):**
   ```bash
   # Using JawsDB (MySQL add-on for Heroku)
   heroku addons:create jawsdb:kitefin
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set ADMIN_PASSWORD=your-admin-password
   heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
   heroku config:set COOKIE_SECURE=true
   heroku config:set NODE_ENV=production
   ```

4. **Create Heroku-compatible Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY backend/package*.json ./
   RUN npm ci --only=production
   COPY backend .
   EXPOSE 5000
   CMD ["node", "src/index.js"]
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **View logs:**
   ```bash
   heroku logs --tail
   ```

---

### Option 3: DigitalOcean App Platform

#### Steps

1. **Prepare docker-compose.yml for App Platform:**
   - Ensure exposed ports are correct
   - Use environment variables for secrets

2. **Connect GitHub repository to DigitalOcean**

3. **Create new App from DigitalOcean console:**
   - Select GitHub repo
   - Choose docker-compose deployment

4. **Configure environment:**
   - Set database password, JWT secret, etc.

5. **Deploy:**
   - App Platform auto-deploys on git push

---

### Option 4: AWS (ECS + RDS)

#### Prerequisites
- AWS account
- AWS CLI configured

#### Steps

1. **Create RDS MySQL instance:**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier blog-db \
     --db-instance-class db.t3.micro \
     --engine mysql \
     --master-username root \
     --master-user-password <strong-password> \
     --allocated-storage 20
   ```

2. **Build and push Docker image to ECR:**
   ```bash
   # Create ECR repo
   aws ecr create-repository --repository-name blog-backend
   
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and tag
   docker build -t blog-backend:latest backend/
   docker tag blog-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/blog-backend:latest
   
   # Push
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/blog-backend:latest
   ```

3. **Deploy to ECS Fargate:**
   - Create ECS cluster
   - Create task definition using image from ECR
   - Create service with load balancer
   - Update environment variables with RDS endpoint

4. **Setup CloudFront + S3 for frontend (optional):**
   ```bash
   # Upload frontend to S3
   aws s3 sync Front-end/ s3://your-bucket/ --delete
   
   # Create CloudFront distribution pointing to S3
   ```

---

## Backup & Restore

### Database Backup

**On server:**
```bash
# Backup
sudo docker compose exec db mysqldump -u root -p$DB_PASSWORD blog_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress
gzip backup_*.sql

# Download to local
scp user@server:/home/user/backup_*.sql.gz ./
```

### Database Restore

**From backup:**
```bash
# Upload backup
scp backup_*.sql.gz user@server:/home/user/

# Decompress
gunzip backup_*.sql.gz

# Restore
docker compose exec -T db mysql -u root -p$DB_PASSWORD blog_db < backup_*.sql
```

---

## Monitoring & Maintenance

### Check Service Status
```bash
docker compose ps
docker compose logs backend
docker compose logs nginx
docker compose logs db
```

### Update Application

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Rebuild services:**
   ```bash
   sudo docker compose up -d --build
   ```

3. **Verify:**
   ```bash
   sudo docker compose ps
   sudo docker compose logs -f backend
   ```

### Database Cleanup

```bash
# Remove old comments
docker compose exec db mysql -u root -p$DB_PASSWORD blog_db -e "DELETE FROM comments WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);"

# Optimize tables
docker compose exec db mysql -u root -p$DB_PASSWORD blog_db -e "OPTIMIZE TABLE posts, comments, saved_posts, users;"
```

---

## Performance Tuning

### Nginx Caching

Add to `nginx/default.conf`:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_saved_user ON saved_posts(user_id);
```

### Enable Gzip Compression

Add to `nginx/default.conf`:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## Troubleshooting Deployment

### Issue: Services won't start
```bash
# Check system resources
docker system df
docker volume ls

# Clean up
docker system prune -a
docker compose restart
```

### Issue: Database connection refused
```bash
# Verify DB is running
docker compose logs db

# Check DB health
docker compose exec db mysql -u root -ppassword -e "SELECT 1"
```

### Issue: Frontend can't reach backend API
```bash
# Verify backend is running
docker compose logs backend

# Check FRONTEND_URL matches domain
docker compose config | grep FRONTEND_URL

# Test API endpoint
curl https://yourdomain.com/api/posts/
```

### Issue: HTTPS certificate issues
```bash
# Check certificate validity
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check nginx SSL config
sudo docker compose exec nginx nginx -t
```

---

## Scaling for Production

### For 1000+ users:
1. Move database to managed service (AWS RDS, CloudSQL)
2. Use CDN for static assets (CloudFront, CloudFlare)
3. Add Redis for caching
4. Implement database connection pooling
5. Use load balancer (nginx, HAProxy, AWS ALB)

### Example scaling with load balancer:
```yaml
upstream backend {
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set `COOKIE_SECURE=true`
- [ ] Use strong `JWT_SECRET`
- [ ] Enable firewall (ufw on Ubuntu)
- [ ] Restrict SSH access
- [ ] Enable database backups
- [ ] Monitor logs regularly
- [ ] Keep Docker images updated
- [ ] Use environment variables for secrets

---

## Rollback Procedure

```bash
# Stop current version
sudo docker compose down

# Revert git changes
git checkout previous-version-hash

# Rebuild and start
sudo docker compose up -d --build

# Verify
sudo docker compose logs -f backend
```

---

**Last Updated**: December 2025
**Status**: Production Ready ✅
