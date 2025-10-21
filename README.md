# School Fee Management System

A modern, full-featured school fee management web application with Netcash payment integration, automated reconciliation, and scheduled payouts.

## Features

### Core Features
- **Family & Student Management**: Track multiple students per family with detailed records
- **Invoice Generation**: Create professional, branded invoices with itemized billing
- **Payment Processing**: Accept payments via Netcash (Card, Instant EFT, QR Code, DebiCheck)
- **Auto-Reconciliation**: Automated payment reconciliation with invoice matching
- **Scheduled Payouts**: Automated payout scheduling to school bank accounts
- **Split Billing**: Support for multiple billing contacts per family
- **Payment Plans**: Create installment-based payment plans for families
- **Branded Statements**: Generate PDF statements with school branding
- **Email Notifications**: Automated email for invoices, payments, and reminders

### User Roles
- **Super Admin**: Full system access, manage multiple schools
- **School Admin**: Manage families, invoices, payments, and payouts for their school
- **Parent**: View invoices, make payments, track balances

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Scheduling**: node-cron
- **Payment Gateway**: Netcash API

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure

```
schoolpmts/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand stores
│   │   ├── lib/              # Utilities and API client
│   │   └── App.tsx
│   └── package.json
│
├── src/server/               # Express backend
│   ├── controllers/          # Route controllers
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   │   ├── auth.service.ts
│   │   ├── invoice.service.ts
│   │   ├── payment.service.ts
│   │   ├── netcash.service.ts
│   │   ├── payout.service.ts
│   │   ├── reconciliation.service.ts
│   │   ├── pdf.service.ts
│   │   └── email.service.ts
│   ├── middleware/           # Express middleware
│   └── index.ts
│
├── prisma/
│   └── schema.prisma         # Database schema
│
├── .env.example              # Environment variables template
├── package.json              # Backend dependencies
└── README.md
```

## Database Schema

### Key Models
- **School**: School details, branding, banking info, Netcash config
- **User**: Authentication, roles (SUPER_ADMIN, SCHOOL_ADMIN, PARENT)
- **Family**: Family contact info, split billing emails
- **Student**: Student details linked to families
- **Invoice**: Invoices with line items, payment plans
- **InvoiceItem**: Individual line items (tuition, books, etc.)
- **Payment**: Payment records with Netcash integration
- **PaymentPlan**: Installment-based payment plans
- **Payout**: Scheduled payouts to schools
- **AuditLog**: Audit trail for important actions

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd schoolpmts
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/schoolfees"
JWT_SECRET=your-secret-key
NETCASH_SERVICE_KEY=your-netcash-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

5. **Set up the database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run migrate:dev

# Optional: Seed database
npm run seed
```

6. **Start development servers**
```bash
# Start both backend and frontend
npm run dev

# Or start separately:
npm run dev:server  # Backend on :3000
npm run dev:client  # Frontend on :5173
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Schools
- `GET /api/schools` - List all schools (admin)
- `POST /api/schools` - Create school (super admin)
- `GET /api/schools/:id` - Get school details
- `PUT /api/schools/:id` - Update school

### Families
- `GET /api/families/school/:schoolId` - List school families
- `POST /api/families` - Create family
- `GET /api/families/:id` - Get family details
- `PUT /api/families/:id` - Update family

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices/:id/send` - Send invoice via email
- `GET /api/invoices/family/:familyId` - List family invoices
- `GET /api/invoices/school/:schoolId` - List school invoices

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:reference` - Get payment by reference
- `GET /api/payments/family/:familyId` - List family payments
- `POST /api/payments/manual` - Record manual payment (admin)
- `POST /api/payments/netcash/notify` - Netcash callback (public)

### Payouts
- `POST /api/payouts/school/:schoolId` - Create payout
- `GET /api/payouts/school/:schoolId` - List school payouts
- `GET /api/payouts/:id` - Get payout details
- `POST /api/payouts/:id/process` - Process payout
- `DELETE /api/payouts/:id` - Cancel payout

### Dashboard
- `GET /api/dashboard/school/:schoolId` - School admin dashboard
- `GET /api/dashboard/parent/:familyId` - Parent dashboard

## Netcash Integration

### Supported Payment Methods

1. **Card Payments**: Credit/debit card processing
2. **Instant EFT**: Real-time bank transfers
3. **QR Code**: Generate QR codes for mobile payments
4. **DebiCheck**: Recurring debit order mandates

### Payment Flow

1. Family initiates payment from parent portal
2. System creates payment record and Netcash request
3. User redirected to Netcash payment page
4. Netcash processes payment and sends callback
5. System verifies callback and updates payment status
6. Invoice balance automatically updated
7. Email confirmation sent to family

### Reconciliation

- **Automatic**: Runs hourly via cron job
- **Manual**: School admin can manually reconcile payments
- Queries Netcash API for pending payment statuses
- Updates invoice balances automatically

## Automated Processes

### Scheduled Jobs (Cron)

1. **Payout Processing** (Default: 2 AM every Monday)
   - Processes pending payouts
   - Transfers funds to school accounts
   - Generates transaction records

2. **Auto-Reconciliation** (Every hour)
   - Checks pending payments with Netcash
   - Updates payment statuses
   - Matches payments to invoices

3. **Overdue Invoice Check** (Can be scheduled)
   - Marks overdue invoices
   - Sends reminder emails

## Email Templates

The system includes branded HTML email templates for:

- Invoice notifications with PDF attachment
- Payment confirmations with receipt
- Payment reminders
- Overdue payment notices
- Monthly statements

All emails use school branding (colors, logo) for consistency.

## Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Secure payment verification with Netcash
- HTTPS enforcement in production
- CORS configuration
- Helmet.js security headers
- SQL injection protection via Prisma ORM
- Audit logging for sensitive operations

## Payment Plans

Create flexible payment plans for families:

```typescript
{
  name: "Annual Tuition - 4 Installments",
  totalAmount: 40000, // R400.00 in cents
  numberOfPayments: 4,
  frequency: "QUARTERLY",
  startDate: "2024-01-01",
  endDate: "2024-12-31"
}
```

Installments are automatically generated and tracked.

## Split Billing

Families can have multiple billing contacts:

```typescript
{
  primaryContact: "John Doe",
  email: "john@example.com",
  billingEmails: ["mother@example.com", "father@example.com"]
}
```

All billing emails receive invoices and statements.

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secrets
4. Configure SMTP for production emails
5. Set up Netcash production credentials
6. Configure HTTPS/SSL certificates

### Build

```bash
# Build backend
npm run build

# Build frontend
npm run build:client
```

### Run

```bash
# Production mode
npm start
```

### Database Migration

```bash
# Run migrations in production
npm run migrate
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License

## Support

For questions or support, contact: support@schoolfees.com

## Roadmap

- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Bulk invoice generation
- [ ] Advanced reporting and analytics
- [ ] Multi-currency support
- [ ] Integration with accounting software
- [ ] Student portal
- [ ] Automatic late fee calculation
- [ ] Payment gateway alternatives (PayFast, Stripe)
