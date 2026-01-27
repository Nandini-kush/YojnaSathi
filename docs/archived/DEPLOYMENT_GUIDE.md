# 🚀 YojnaSathi Deployment Guide

Complete guide to deploy YojnaSathi (Backend + Frontend) to production.

---

## 📋 Pre-Deployment Checklist

### Backend Preparation
- [ ] All endpoints tested in Swagger UI
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] CORS configured for frontend URL
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Security headers enabled

### Frontend Preparation
- [ ] All pages tested locally
- [ ] API integration verified
- [ ] Environment variables set
- [ ] Build process tested
- [ ] All links working correctly
- [ ] Responsive design tested on mobile
- [ ] Performance optimized

---

## 🔧 Backend Deployment

### Option 1: Railway (Recommended for beginners)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/yojnasathi.git
   git push -u origin main
   ```

2. **Create Railway Project**
   - Visit [railway.app](https://railway.app)
   - Connect GitHub account
   - Select repository
   - Choose Python as language
   - Configure environment variables

3. **Set Environment Variables in Railway**
   ```
   DATABASE_URL=your_postgresql_url
   ENVIRONMENT=production
   SECRET_KEY=your_secret_key
   ```

4. **Deploy**
   - Railway auto-deploys on push
   - View logs in Railway dashboard
   - Get public URL for API

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   # Windows
   choco install heroku-cli
   
   # macOS
   brew install heroku/brew/heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create yojnasathi-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set DATABASE_URL=your_postgresql_url
   heroku config:set ENVIRONMENT=production
   heroku config:set SECRET_KEY=your_secret_key
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: AWS/DigitalOcean VPS

1. **Create VPS Instance**
   - DigitalOcean: Create Droplet (Ubuntu 22.04)
   - AWS: Launch EC2 instance (Ubuntu AMI)

2. **SSH into Server**
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Dependencies**
   ```bash
   apt update
   apt install python3-pip python3-venv postgresql nginx
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/yojnasathi.git
   cd yojnasathi
   ```

5. **Setup Python Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

6. **Setup Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE yojnasathi;
   CREATE USER yojnasathi WITH PASSWORD 'your_password';
   ALTER ROLE yojnasathi SET client_encoding TO 'utf8';
   GRANT ALL PRIVILEGES ON DATABASE yojnasathi TO yojnasathi;
   ```

7. **Run Migrations**
   ```bash
   python -m app.db.init_db
   ```

8. **Setup Gunicorn**
   ```bash
   pip install gunicorn
   ```

9. **Configure Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/yojnasathi.service
   ```
   
   Add:
   ```ini
   [Unit]
   Description=YojnaSathi Backend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/home/yojnasathi
   ExecStart=/home/yojnasathi/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app.main:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

10. **Setup Nginx Reverse Proxy**
    ```bash
    sudo nano /etc/nginx/sites-available/yojnasathi
    ```
    
    Add:
    ```nginx
    server {
        listen 80;
        server_name your_domain.com;

        location / {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

11. **Enable and Start Services**
    ```bash
    sudo systemctl enable yojnasathi
    sudo systemctl start yojnasathi
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    ```

12. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your_domain.com
    ```

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Push Frontend to GitHub**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Frontend initial commit"
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import Git repository
   - Select `frontend` folder as root
   - Configure build settings

3. **Set Environment Variables in Vercel**
   ```
   VITE_API_URL=https://your-api-domain.com
   ```

4. **Deploy**
   - Vercel auto-deploys on push
   - Get public URL

### Option 2: Netlify

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Drag & drop `dist` folder
   - Or connect GitHub for auto-deploy

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 3: AWS S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - Create bucket with unique name
   - Enable static website hosting
   - Upload `dist` contents

3. **Create CloudFront Distribution**
   - Set S3 bucket as origin
   - Set custom domain
   - Enable HTTPS

4. **Update DNS**
   - Point domain to CloudFront distribution

---

## 🔐 Security Configuration

### Backend Security

1. **Set CORS for Production**
   ```python
   # app/main.py
   origins = ["https://your-frontend-domain.com"]
   app.add_middleware(
       CORSMiddleware,
       allow_origins=origins,
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Enable HTTPS Only**
   - Update `ENVIRONMENT=production`
   - Configure SSL certificate
   - Redirect HTTP to HTTPS

3. **Set Secure Headers**
   ```python
   @app.middleware("http")
   async def add_security_headers(request, call_next):
       response = await call_next(request)
       response.headers["X-Content-Type-Options"] = "nosniff"
       response.headers["X-Frame-Options"] = "DENY"
       response.headers["X-XSS-Protection"] = "1; mode=block"
       return response
   ```

### Frontend Security

1. **Update API URL**
   - Change `VITE_API_URL` to production backend URL
   - Ensure HTTPS protocol

2. **Security Headers**
   - Configure in web server (nginx, Vercel)
   - CSP, X-Frame-Options, etc.

3. **Sensitive Data**
   - Never commit `.env` file
   - Use environment variables
   - Validate all user input

---

## 📊 Monitoring & Maintenance

### Backend Monitoring

1. **Enable Logging**
   ```python
   import logging
   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)
   ```

2. **Setup Error Tracking**
   - Integrate Sentry
   - Setup error alerts
   - Monitor API performance

3. **Database Backups**
   ```bash
   # Daily backup
   pg_dump yojnasathi > backup_$(date +%Y%m%d).sql
   
   # Automate with cron
   0 2 * * * /path/to/backup.sh
   ```

### Frontend Monitoring

1. **Setup Analytics**
   - Google Analytics
   - Mixpanel
   - Track user behavior

2. **Error Tracking**
   - Sentry for frontend errors
   - Monitor console errors
   - User session tracking

3. **Performance Monitoring**
   - Measure Core Web Vitals
   - Monitor load times
   - Track conversions

---

## 🚀 Post-Deployment

1. **Verify Deployment**
   - Test all endpoints
   - Test authentication flow
   - Test scheme discovery
   - Test mobile responsiveness

2. **Update Documentation**
   - Update deployment URLs
   - Document any changes
   - Share with team

3. **Setup Monitoring**
   - Enable error tracking
   - Setup uptime monitoring
   - Configure alerts

4. **Plan Maintenance**
   - Schedule regular backups
   - Plan updates
   - Monitor performance

---

## 🆘 Troubleshooting

### Backend Issues

**Database Connection Error**
```bash
# Check database connection
psql -U yojnasathi -d yojnasathi -h localhost

# Reset if needed
sudo -u postgres psql -c "DROP DATABASE yojnasathi;"
```

**API Not Responding**
```bash
# Check service status
sudo systemctl status yojnasathi

# View logs
sudo journalctl -u yojnasathi -f
```

### Frontend Issues

**Blank Page**
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Check network requests

**API Errors**
- Verify CORS configuration
- Check API endpoint URLs
- Verify authentication token

---

## 📞 Support Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Heroku Documentation](https://devcenter.heroku.com)

---

## ✅ Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] CORS configured
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set
- [ ] Database configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Tests passed
- [ ] Team notified

---

**Deployment Complete! 🎉**
