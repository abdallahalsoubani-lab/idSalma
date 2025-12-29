# SalmaAIID - Setup Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database ready
- [ ] AWS Account with:
  - [ ] S3 bucket created
  - [ ] IAM user with Textract access
  - [ ] IAM user with Rekognition access
  - [ ] Access keys generated

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` file with your credentials:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# AWS - Add your credentials
AWS_REGION="me-south-1"  # or your preferred region
AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AWS_S3_BUCKET="your-bucket-name"

# NextAuth - Generate secret
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it in `.env` as `NEXTAUTH_SECRET`

### 4. Setup AWS Resources

#### Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name --region me-south-1
```

#### Create IAM Policy

Create a policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeID",
        "rekognition:CreateFaceLivenessSession",
        "rekognition:GetFaceLivenessSessionResults",
        "rekognition:CompareFaces",
        "rekognition:DetectFaces",
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "*"
    }
  ]
}
```

#### Create IAM User

1. Create IAM user: `salmaaiid-app`
2. Attach the policy created above
3. Generate access keys
4. Add keys to `.env`

### 5. Setup Database

```bash
# Push schema to database
npm run db:push

# Seed initial data (creates admin user)
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 7. Login to Admin

- URL: http://localhost:3000/admin/login
- Email: `admin@salmaaiid.com`
- Password: `admin123`

**⚠️ IMPORTANT: Change this password immediately!**

## Testing the Flow

### 1. User Verification Flow

1. Go to http://localhost:3000
2. Click "Start Verification"
3. Accept consent and choose document type
4. Upload sample Jordanian ID or Passport
5. Review extracted data
6. Complete liveness check
7. View face match results
8. Get final decision

### 2. Admin Review

1. Login to admin dashboard
2. View all sessions
3. Click on a session to review
4. Override decision if needed

## Common Issues

### Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Test connection: `psql $DATABASE_URL`

### AWS Credentials Invalid

**Error**: `The security token included in the request is invalid`

**Solution**:
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check IAM user has required permissions
- Ensure region is correct

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Migration

For production, use migrations instead of `db:push`:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

### Environment Variables

Add all `.env` variables to your hosting platform:
- Vercel: Project Settings → Environment Variables
- AWS: Use Parameter Store or Secrets Manager
- Docker: Use .env file or docker-compose

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable AWS IAM least privilege
- [ ] Use environment-specific databases
- [ ] Enable CORS restrictions
- [ ] Add rate limiting
- [ ] Enable HTTPS in production
- [ ] Regular security updates

## Support

For issues:
1. Check this guide
2. Check README.md
3. Open GitHub issue
4. Contact support

---

Happy coding! 🚀
