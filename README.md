# SalmaAIID - KYC/Onboarding Web Demo

Complete KYC (Know Your Customer) verification platform for Jordanian identity documents using AWS AI services.

## 🎯 Features

- **Document Upload**: Support for Jordanian ID Cards and Passports
- **OCR Extraction**: Automated data extraction using Amazon Textract AnalyzeID
- **Liveness Detection**: Face liveness verification using Amazon Rekognition
- **Face Matching**: Compare ID photo with live selfie using Amazon Rekognition CompareFaces
- **Automated Decisions**: Smart decision engine for approve/reject/manual review
- **Admin Console**: Full-featured admin dashboard for session review and management
- **Audit Logging**: Complete audit trail of all verification events

## 🛠 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- AWS Amplify UI (Liveness)

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL

### AWS Services
- Amazon S3 (Document Storage)
- Amazon Textract (AnalyzeID)
- Amazon Rekognition (Face Liveness + CompareFaces)

### Authentication
- NextAuth.js

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- AWS Account with:
  - S3 bucket
  - Textract access
  - Rekognition access
  - IAM credentials

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd idSalma
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/salmaaiid"

# AWS
AWS_REGION="me-south-1"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET="salma-ai-id-documents"

# NextAuth
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
# Push Prisma schema to database
npm run db:push

# Seed initial data (creates admin user and settings)
npx ts-node prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Default Credentials

After seeding, use these credentials to access admin panel:

- **Email**: `admin@salmaaiid.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## 📁 Project Structure

```
idSalma/
├── app/
│   ├── (user)/                 # User-facing pages
│   │   ├── page.tsx            # Landing page
│   │   ├── consent/            # Consent & document type
│   │   └── verify/[id]/        # Verification flow
│   ├── admin/                  # Admin console
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── sessions/[id]/
│   │   └── settings/
│   └── api/                    # API routes
│       ├── sessions/           # Session management
│       ├── admin/              # Admin APIs
│       └── auth/               # NextAuth
├── components/
│   ├── ui/                     # shadcn components
│   ├── user/                   # User components
│   └── admin/                  # Admin components
├── lib/
│   ├── aws/                    # AWS service wrappers
│   │   ├── s3.ts
│   │   ├── textract.ts
│   │   ├── rekognition-liveness.ts
│   │   └── rekognition-face.ts
│   ├── db.ts                   # Prisma client
│   ├── decision-engine.ts      # Decision logic
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── types/
    └── index.ts
```

## 🔄 User Verification Flow

1. **Landing Page** (`/`)
   - Introduction to the service
   - "Start Verification" button

2. **Consent** (`/consent`)
   - User accepts data processing terms
   - Selects document type (ID Card or Passport)

3. **Document Upload** (`/verify/[id]/upload`)
   - Upload front (and back for ID cards)
   - Auto-run OCR after upload

4. **OCR Review** (`/verify/[id]/ocr-review`)
   - Review extracted data
   - Confidence scores for each field

5. **Liveness Check** (`/verify/[id]/liveness`)
   - AWS Rekognition Face Liveness
   - Camera-based verification

6. **Face Match** (`/verify/[id]/face-match`)
   - Compare ID photo with selfie
   - Show similarity score

7. **Result** (`/verify/[id]/result`)
   - Final decision: Approved/Rejected/Manual Review
   - All scores and flags
   - Download report option

## 🔧 Admin Features

### Dashboard (`/admin/dashboard`)
- View all sessions
- Filter by status/decision
- Statistics cards
- Quick actions

### Session Review (`/admin/sessions/[id]`)
- Full session details
- All extracted data
- Verification scores
- Flags and issues
- Manual override (approve/reject)

### Settings (`/admin/settings`)
- Adjust verification thresholds
- Face match threshold
- OCR minimum confidence
- Liveness threshold
- Data retention period

## 🇯🇴 Supported Jordanian Documents

### ID Card (البطاقة الشخصية)

**Front Side Fields:**
- Full Name (EN & AR)
- National Number (10 digits)
- Date of Birth
- Gender
- Place of Birth
- Photo

**Back Side Fields:**
- Card Number
- Expiry Date
- Blood Type
- MRZ (Machine Readable Zone)

### Passport (جواز السفر)

**Data Page Fields:**
- Full Name
- Passport Number
- National Number
- Date of Birth
- Date of Issue/Expiry
- Place of Issue
- Mother's Name
- MRZ

## ⚙️ Decision Engine Logic

The system automatically categorizes verifications:

### ✅ APPROVED
All checks passed:
- OCR confidence ≥ threshold
- Liveness score ≥ threshold
- Face match ≥ threshold
- No critical flags

### ❌ REJECTED
Critical failures:
- Liveness check failed
- Face match too low (< threshold - 10%)
- Document expired
- No face detected

### ⏳ MANUAL_REVIEW
Borderline cases:
- Face match near threshold
- OCR confidence low
- Missing critical fields
- Multiple faces detected

## 🔐 Security

- All data encrypted in transit and at rest
- AWS IAM for service access control
- NextAuth for admin authentication
- Automatic data deletion after retention period
- No third-party data sharing
- Complete audit logging

## 📊 Database Schema

Key models:
- **Session**: Verification sessions
- **AuditLog**: Event tracking
- **Admin**: Admin users
- **SystemSettings**: Configurable thresholds

See `prisma/schema.prisma` for complete schema.

## 🧪 Testing

For testing without real documents:

1. Upload sample ID images
2. System will extract available data
3. Liveness check can be simulated
4. Face match uses uploaded images

## 🚢 Deployment

### Environment Setup

1. Setup PostgreSQL database (e.g., Neon, Supabase)
2. Create AWS resources:
   - S3 bucket with appropriate permissions
   - IAM user with Textract, Rekognition, S3 access
3. Configure environment variables
4. Deploy to Vercel/AWS/Docker

### Build Commands

```bash
npm run build    # Build production bundle
npm run start    # Start production server
```

## 📝 API Routes

### Public APIs
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get session
- `POST /api/sessions/[id]/documents` - Upload documents
- `POST /api/sessions/[id]/ocr` - Run OCR
- `POST /api/sessions/[id]/liveness` - Create liveness session
- `PUT /api/sessions/[id]/liveness` - Complete liveness
- `POST /api/sessions/[id]/face-match` - Compare faces
- `POST /api/sessions/[id]/decision` - Calculate decision
- `GET /api/sessions/[id]/report` - Get report

### Admin APIs (Protected)
- `GET /api/admin/sessions` - List all sessions
- `POST /api/admin/sessions/[id]/override` - Override decision
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## 🐛 Troubleshooting

### Prisma Issues
```bash
npx prisma generate
npx prisma db push
```

### AWS Permissions
Ensure IAM user has:
- `textract:AnalyzeID`
- `rekognition:CreateFaceLivenessSession`
- `rekognition:GetFaceLivenessSessionResults`
- `rekognition:CompareFaces`
- `rekognition:DetectFaces`
- `s3:PutObject`
- `s3:GetObject`

### Database Connection
Check DATABASE_URL format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

## 📄 License

MIT

## 👥 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Next.js, AWS AI Services, and Prisma
