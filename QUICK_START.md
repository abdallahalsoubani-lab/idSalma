# SalmaAIID - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

**Required:** Update these in `.env`:
- `DATABASE_URL` - Your PostgreSQL connection string
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_S3_BUCKET` - Your S3 bucket name
- `NEXTAUTH_SECRET` - Run `openssl rand -base64 32`

### 3. Setup Database
```bash
npm run db:push
npx ts-node prisma/seed.ts
```

### 4. Run Application
```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Test the System

**User Flow:**
1. Go to http://localhost:3000
2. Click "Start Verification"
3. Accept consent
4. Upload Jordanian ID or Passport
5. Complete verification steps

**Admin Access:**
1. Go to http://localhost:3000/admin/login
2. Email: `admin@salmaaiid.com`
3. Password: `admin123`

## 📋 Project Structure Overview

```
app/
├── (user)/          # User verification flow
├── admin/           # Admin console
└── api/             # Backend API routes

lib/
├── aws/             # AWS service integrations
├── db.ts            # Database client
└── decision-engine.ts  # Verification logic

components/
└── ui/              # Reusable UI components

prisma/
└── schema.prisma    # Database schema
```

## 🔑 Key Features

✅ **Jordanian Document Support**
- ID Cards (front + back)
- Passports (data page)

✅ **AWS AI Integration**
- Textract for OCR
- Rekognition for liveness
- Rekognition for face matching

✅ **Automated Decision Engine**
- Approve/Reject/Manual Review
- Configurable thresholds

✅ **Admin Console**
- Session management
- Manual override
- Settings configuration

## 📱 User Verification Steps

1. **Consent** - Accept terms + select document type
2. **Upload** - Upload ID/Passport images
3. **OCR** - Automatic data extraction
4. **Review** - Verify extracted data
5. **Liveness** - Face liveness check
6. **Match** - Compare ID photo vs selfie
7. **Decision** - Get verification result

## 🔧 Admin Features

- View all verification sessions
- Filter by status/decision
- Review session details
- Override automated decisions
- Configure verification thresholds
- View audit logs

## 🛠 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed initial data

# Code Quality
npm run lint         # Run ESLint
```

## 📊 Database Models

- **Session** - Verification sessions
- **AuditLog** - Event tracking
- **Admin** - Admin users
- **SystemSettings** - Configuration

## 🌐 API Endpoints

**User:**
- `POST /api/sessions` - Create session
- `POST /api/sessions/[id]/documents` - Upload
- `POST /api/sessions/[id]/ocr` - Extract data
- `POST /api/sessions/[id]/liveness` - Liveness check
- `POST /api/sessions/[id]/face-match` - Compare faces
- `POST /api/sessions/[id]/decision` - Get decision

**Admin:**
- `GET /api/admin/sessions` - List sessions
- `POST /api/admin/sessions/[id]/override` - Override
- `GET/PUT /api/admin/settings` - Manage settings

## 🔐 Security

- NextAuth.js for authentication
- Bcrypt password hashing
- AWS IAM for service access
- Environment-based configuration
- Audit logging for all actions

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://..."
AWS_REGION="me-south-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🎯 Next Steps

1. ✅ Complete setup above
2. ✅ Test user verification flow
3. ✅ Test admin console
4. ✅ Customize thresholds in settings
5. ✅ Review documentation (README.md)
6. ✅ Check setup guide (SETUP_GUIDE.md)
7. ✅ Deploy to production

## 📚 Documentation

- **README.md** - Complete project documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **PROJECT_SUMMARY.md** - Feature list and architecture
- **QUICK_START.md** - This file

## 🆘 Troubleshooting

**Database Error?**
→ Check DATABASE_URL is correct

**AWS Permissions Error?**
→ Verify IAM user has Textract, Rekognition, S3 access

**Port Already in Use?**
→ Kill process: `lsof -ti:3000 | xargs kill -9`

**Prisma Client Error?**
→ Run: `npx prisma generate`

## 📞 Support

- Check documentation files
- Review code comments
- Open GitHub issue

---

**Ready to verify!** 🎉

Built with Next.js 14, TypeScript, AWS AI Services, and Prisma.
