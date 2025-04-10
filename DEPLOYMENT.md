# Deployment Guide

This document provides instructions for deploying the Document Conversion Application in different environments.

## Prerequisites

- Node.js v16+ and npm
- Docker (for containerized deployment)
- Git

## Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/document-conversion.git
   cd document-conversion
   ```

2. Create environment variables:
   ```
   cp .env.example .env
   ```

3. Edit the `.env` file to set appropriate values for your environment.

## Local Deployment

### Using Desktop Launchers

For end-users on desktop computers:

#### macOS
1. Copy the application folder to the desired location
2. Double-click `Launch Application.command` to start the application
3. The application will automatically install dependencies, start services, and open in the default browser

#### Windows
1. Copy the application folder to the desired location
2. Double-click `Launch Application.bat` to start the application
3. The application will automatically install dependencies, start services, and open in the default browser

### Manual Deployment

1. Install dependencies:
   ```
   npm install
   ```

2. Build the application:
   ```
   npm run build
   ```

3. Start the production server:
   ```
   npm run start:prod
   ```

## Docker Deployment

1. Build the Docker image:
   ```
   docker build -t document-conversion .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 -p 3333:3333 --env-file .env document-conversion
   ```

## Cloud Deployment

### AWS Elastic Beanstalk

1. Install the EB CLI:
   ```
   pip install awsebcli
   ```

2. Initialize your EB environment:
   ```
   eb init
   ```

3. Create an environment:
   ```
   eb create document-conversion-env
   ```

4. Deploy your application:
   ```
   eb deploy
   ```

### Heroku

1. Install the Heroku CLI:
   ```
   npm install -g heroku
   ```

2. Login to Heroku:
   ```
   heroku login
   ```

3. Create a new Heroku app:
   ```
   heroku create document-conversion-app
   ```

4. Set environment variables:
   ```
   heroku config:set NODE_ENV=production JWT_SECRET=your-secret-key
   ```

5. Deploy to Heroku:
   ```
   git push heroku main
   ```

## Scaling Considerations

The application can be scaled in several ways:

1. **Horizontal Scaling**: Deploy multiple instances behind a load balancer
2. **Database**: For production, replace file-based storage with a database
3. **File Storage**: Use cloud storage services like S3 for file storage
4. **Memory**: Increase container memory for handling larger files

## Security Checklist

- [ ] Change all default secrets in the `.env` file
- [ ] Enable rate limiting for production
- [ ] Set up HTTPS with a valid SSL certificate
- [ ] Configure proper CORS settings for your domains
- [ ] Enable authentication for multi-user environments
- [ ] Set appropriate file size limits
- [ ] Configure automatic cleanup for temporary files

## Monitoring

For production deployments:

1. Set up application monitoring using services like New Relic, Datadog, or AWS CloudWatch
2. Configure log aggregation to a central service
3. Set up alerts for system errors and high resource usage
4. Monitor API endpoints for performance and errors

## Backup Strategy

1. Regularly backup any persistent data
2. For file storage, consider using a service with built-in redundancy
3. Set up database backups if using a database

## Troubleshooting

Common issues:

1. **Application won't start**: Check environment variables and port availability
2. **File uploads fail**: Check directory permissions and file size limits
3. **Conversion errors**: Check logs for specific error messages
4. **High memory usage**: Adjust container resources or implement batch processing

If you encounter issues not covered here, please check the application logs or submit an issue on the repository.