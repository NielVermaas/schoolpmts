import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Routes
import authRoutes from './routes/auth.routes';
import schoolRoutes from './routes/school.routes';
import familyRoutes from './routes/family.routes';
import studentRoutes from './routes/student.routes';
import invoiceRoutes from './routes/invoice.routes';
import paymentRoutes from './routes/payment.routes';
import payoutRoutes from './routes/payout.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Services
import { PayoutService } from './services/payout.service';
import { ReconciliationService } from './services/reconciliation.service';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Scheduled jobs
const payoutService = new PayoutService();
const reconciliationService = new ReconciliationService();

// Run payout processing (configurable via env, default: 2 AM every Monday)
const payoutSchedule = process.env.PAYOUT_SCHEDULE || '0 2 * * 1';
cron.schedule(payoutSchedule, async () => {
  console.log('Running scheduled payout processing...');
  await payoutService.processScheduledPayouts();
});

// Run reconciliation check every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running automated reconciliation...');
  await reconciliationService.autoReconcile();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Payout schedule: ${payoutSchedule}`);
});

export default app;
