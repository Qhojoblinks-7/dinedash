# DineDash Production Deployment Guide

## Overview
DineDash is a restaurant management system with three main components:
- **Backend (Django REST API)** - Hosted on Render
- **Customer Frontend (React)** - Hosted on Vercel
- **Staff Dashboard (React)** - Hosted on Vercel

## Prerequisites
- Render account for backend deployment
- Vercel account for frontend deployments
- GitHub repository with the project code

## Backend Deployment (Render)

### 1. Prepare Backend for Production
```bash
cd dinedash-backend

# The render.yaml file is already configured
# Update the CORS_ALLOWED_ORIGINS in render.yaml with your actual Vercel URLs
```

### 2. Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the `dinedash-backend/render.yaml` file
5. Configure environment variables:
   - `FLUTTERWAVE_PUBLIC_KEY`: Your Flutterwave public key
   - `FLUTTERWAVE_SECRET_KEY`: Your Flutterwave secret key
6. Deploy the service

### 3. Get Your Render URL
After deployment, note your Render backend URL (e.g., `https://dinedash-backend.onrender.com`)

**Important**: Update your `dinedash-backend/dinedash/settings.py` file with your actual Render URL in the `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` settings.

## Frontend Deployments (Vercel)

### Customer Frontend (dinedash-client)

1. **Prepare Environment Variables**:
```bash
cd dinedash-client
cp .env.example .env
# Edit .env and set VITE_API_URL to your Render backend URL
```

2. **Deploy to Vercel**:
```bash
npm install -g vercel
vercel --prod
# Follow the prompts to connect your GitHub repo
```

3. **Configure Environment Variables in Vercel**:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-render-backend-url.onrender.com/api`

### Staff Dashboard (dinedash-dashboard)

1. **Prepare Environment Variables**:
```bash
cd dinedash-dashboard
cp .env.example .env
# Edit .env and set VITE_API_URL to your Render backend URL
```

2. **Deploy to Vercel**:
```bash
npm install -g vercel
vercel --prod
# Follow the prompts to connect your GitHub repo
```

3. **Configure Environment Variables in Vercel**:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-render-backend-url.onrender.com/api`

## Post-Deployment Configuration

### Update CORS Settings
In your Render backend service, update the `CORS_ALLOWED_ORIGINS` environment variable with your actual Vercel URLs:

```
CORS_ALLOWED_ORIGINS=https://your-customer-frontend.vercel.app,https://your-dashboard.vercel.app
```

### Database Setup
The Render blueprint automatically creates a PostgreSQL database. Migrations run automatically during deployment.

## Testing Production Deployment

1. **Test Customer Frontend**:
   - Visit your Vercel customer frontend URL
   - Try browsing meals and placing an order

2. **Test Staff Dashboard**:
   - Visit your Vercel dashboard URL
   - Try viewing orders and managing meals

3. **Verify API Connectivity**:
   - Check browser developer tools for any CORS or API errors
   - Ensure all CRUD operations work correctly

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Update `CORS_ALLOWED_ORIGINS` in Render with correct Vercel URLs
2. **API Connection Issues**: Verify `VITE_API_URL` environment variables in Vercel
3. **Static Files**: Ensure Django `collectstatic` ran successfully in Render
4. **Database Issues**: Check Render database connection and run migrations if needed

### Logs:
- **Render**: Check service logs in Render dashboard
- **Vercel**: Check deployment logs and runtime logs in Vercel dashboard

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **HTTPS**: All services use HTTPS by default
3. **CORS**: Properly configured to only allow your frontend domains
4. **Authentication**: Staff operations require authentication (configured for production)

## Performance Optimization

1. **Database Indexes**: Consider adding indexes on frequently queried fields
2. **Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Use Vercel's built-in CDN for static assets
4. **Monitoring**: Set up error tracking and performance monitoring

## Maintenance

- **Regular Updates**: Keep dependencies updated
- **Backup**: Render provides automatic database backups
- **Monitoring**: Monitor Render and Vercel dashboards for issues
- **Scaling**: Upgrade Render and Vercel plans as needed

## Support

For deployment issues:
1. Check Render/Vercel documentation
2. Review application logs
3. Verify environment variable configuration
4. Test API endpoints directly using tools like Postman