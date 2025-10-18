# DineDash Backend Deployment Guide - Render

## Overview
This guide provides step-by-step instructions for deploying the DineDash Django backend to Render.com.

## Prerequisites
- Render account (free tier available)
- Git repository set up
- GitHub account for automatic deployments

## Step 1: Render Setup

### 1.1 Create Render Account
- Sign up at [render.com](https://render.com)
- Connect your GitHub account for automatic deployments

### 1.2 Create PostgreSQL Database
1. In Render dashboard, click "New" → "PostgreSQL"
2. Choose "Free" plan
3. Name it `dinedash-db`
4. Note the connection string for later

## Step 2: Deploy Web Service

### 2.1 Manual Setup (Recommended for beginners)
1. In Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `dinedash-backend`
   - **Runtime**: `Python`
   - **Build Command**: `./build.sh`
   - **Start Command**: `./start.sh`

### 2.2 Environment Variables
Set these environment variables in your Render web service:

```
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=your-render-app-url.onrender.com
DATABASE_URL=postgresql://... (from your Render PostgreSQL database)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
```

### 2.3 Alternative: Blueprint Deployment
If you prefer using the blueprint file:
1. Push the `render.yaml` file to your repository
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your repository and select the `render.yaml` file

## Step 3: Database Setup

### 3.1 Automatic Migration
The build script automatically runs database migrations, so your database will be set up when deployment completes.

### 3.2 Manual Migration (if needed)
If you need to run migrations manually:
```bash
render run --service dinedash-backend python manage.py migrate
```

## Step 4: Testing and Monitoring

### 4.1 Test the Application
Visit your Render app URL and test key endpoints:
- API endpoints: `https://your-app.onrender.com/api/`
- Admin panel: `https://your-app.onrender.com/admin/`

### 4.2 View Logs
```bash
render logs --service dinedash-backend
```

### 4.3 Monitor Performance
- Check Render dashboard for CPU/memory usage
- Monitor response times and error rates

## Step 5: Frontend Deployment

### 5.1 Deploy Client (React)
1. Create a new Static Site in Render
2. Connect your `dinedash-client` repository
3. Set build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### 5.2 Deploy Dashboard (React)
1. Create another Static Site in Render
2. Connect your `dinedash-dashboard` repository
3. Use same build settings as client

### 5.3 Update CORS Settings
After deploying frontend, update `CORS_ALLOWED_ORIGINS` in your backend service:
```
CORS_ALLOWED_ORIGINS=https://dinedash-client.onrender.com,https://dinedash-dashboard.onrender.com
```

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain
1. In Render dashboard, go to your web service
2. Click "Settings" → "Custom Domain"
3. Add your domain and follow DNS instructions

### 6.2 Update Environment Variables
When using a custom domain, update:
```
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Free Tier Limitations

**Render Free Tier:**
- 750 hours/month (~31 days)
- 512 MB RAM
- 1 GB storage (PostgreSQL)
- Automatic sleep after 15 minutes of inactivity

**Tips to stay within free tier:**
- Monitor usage in Render dashboard
- Consider upgrading to paid plan for production
- Use caching to reduce database load

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check build logs for dependency issues
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Static Files**: Ensure build.sh runs collectstatic
4. **CORS Errors**: Check CORS_ALLOWED_ORIGINS settings

### Debug Commands:
```bash
# View recent logs
render logs --service dinedash-backend --tail

# Run management commands
render run --service dinedash-backend python manage.py shell

# Check environment variables
render env list --service dinedash-backend
```

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| DEBUG | Django debug mode | False | Yes |
| SECRET_KEY | Django secret key | random-string | Yes |
| ALLOWED_HOSTS | Render app URL | your-app.onrender.com | Yes |
| DATABASE_URL | Render PostgreSQL | postgresql://... | Yes |
| CORS_ALLOWED_ORIGINS | Frontend URLs | https://client.onrender.com | Yes |
| FLUTTERWAVE_PUBLIC_KEY | Payment integration | fw-pub-... | No |
| FLUTTERWAVE_SECRET_KEY | Payment integration | fw-sec-... | No |
| DATA_UPLOAD_MAX_MEMORY_SIZE | Max upload size | 10485760 | No |
| FILE_UPLOAD_MAX_MEMORY_SIZE | Max file size | 10485760 | No |
| RENDER_EXTERNAL_URL | Render app URL | https://app.onrender.com | Auto |
| VERCEL_URL | Vercel deployment URL | app.vercel.app | Auto |

## Security Checklist

- [ ] DEBUG=False in production
- [ ] SECRET_KEY is secure and unique (use Django's `get_random_secret_key()`)
- [ ] ALLOWED_HOSTS configured correctly
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled (configured in settings)
- [ ] HTTPS enabled in production
- [ ] Regular dependency updates
- [ ] File upload validation in place
- [ ] Input sanitization implemented
- [ ] Error logging configured
- [ ] Database indexes optimized

## Support

For issues:
1. Check Render documentation
2. Review Django deployment docs
3. Check service logs in Render dashboard
4. Contact Render support for platform issues

## Cost Optimization

**Free Tier Strategy:**
- Monitor monthly usage
- Consider paid plans for production ($7/month for web services)
- Use Render's usage alerts

**Scaling:**
- Upgrade to paid plans as needed
- Consider Redis for caching
- Optimize database queries