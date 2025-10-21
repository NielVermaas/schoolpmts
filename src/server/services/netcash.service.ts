import axios from 'axios';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { AppError } from '../middleware/errorHandler';

export interface NetcashPaymentRequest {
  amount: number; // in cents
  reference: string;
  email: string;
  method: 'CARD' | 'INSTANT_EFT' | 'QR_CODE' | 'DEBICHECK';
  returnUrl?: string;
  cancelUrl?: string;
  notifyUrl?: string;
}

export interface NetcashPaymentResponse {
  paymentUrl?: string;
  qrCode?: string;
  requestId: string;
  reference: string;
}

export class NetcashService {
  private serviceKey: string;
  private apiUrl: string;

  constructor() {
    this.serviceKey = process.env.NETCASH_SERVICE_KEY || '';
    this.apiUrl = process.env.NETCASH_API_URL || 'https://paynow.netcash.co.za/site/paynow.aspx';

    if (!this.serviceKey) {
      console.warn('Netcash service key not configured');
    }
  }

  /**
   * Create a payment request for card or Instant EFT
   */
  async createPayment(request: NetcashPaymentRequest): Promise<NetcashPaymentResponse> {
    try {
      const amountInRands = (request.amount / 100).toFixed(2);
      const requestId = this.generateRequestId();

      // Build Netcash payment parameters
      const params = new URLSearchParams({
        m1: this.serviceKey, // Service key
        m2: requestId, // Unique request ID
        p2: requestId, // Reference
        p3: request.reference, // Additional reference
        p4: amountInRands, // Amount
        Budget: 'N', // Budget facility
        m4: request.email, // Customer email
        m5: request.notifyUrl || `${process.env.FRONTEND_URL}/api/payments/netcash/notify`,
        m6: request.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        m9: request.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
      });

      const paymentUrl = `${this.apiUrl}?${params.toString()}`;

      // For QR code payments, generate QR code
      if (request.method === 'QR_CODE') {
        const qrCode = await this.generateQRCode(paymentUrl);
        return {
          qrCode,
          requestId,
          reference: request.reference
        };
      }

      return {
        paymentUrl,
        requestId,
        reference: request.reference
      };
    } catch (error) {
      console.error('Netcash payment creation error:', error);
      throw new AppError('Failed to create payment', 500);
    }
  }

  /**
   * Create a DebiCheck mandate request
   */
  async createDebiCheckMandate(params: {
    amount: number;
    reference: string;
    email: string;
    accountHolder: string;
    frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    startDate: Date;
    endDate?: Date;
  }): Promise<NetcashPaymentResponse> {
    try {
      const requestId = this.generateRequestId();

      // DebiCheck mandate parameters
      const mandateParams = {
        serviceKey: this.serviceKey,
        requestId,
        reference: params.reference,
        amount: (params.amount / 100).toFixed(2),
        email: params.email,
        accountHolder: params.accountHolder,
        frequency: params.frequency,
        startDate: params.startDate.toISOString().split('T')[0],
        endDate: params.endDate?.toISOString().split('T')[0]
      };

      // In production, this would call Netcash's DebiCheck API
      // For now, return a mock response
      console.log('DebiCheck mandate request:', mandateParams);

      return {
        paymentUrl: `${this.apiUrl}/debicheck?requestId=${requestId}`,
        requestId,
        reference: params.reference
      };
    } catch (error) {
      console.error('DebiCheck mandate creation error:', error);
      throw new AppError('Failed to create DebiCheck mandate', 500);
    }
  }

  /**
   * Verify payment callback from Netcash
   */
  async verifyPayment(params: {
    requestId: string;
    reference: string;
    amount: string;
    status: string;
    hash?: string;
  }): Promise<boolean> {
    try {
      // Verify hash if provided (security measure)
      if (params.hash) {
        const expectedHash = this.generateHash(
          params.requestId,
          params.amount,
          params.status
        );

        if (params.hash !== expectedHash) {
          console.error('Payment hash mismatch');
          return false;
        }
      }

      // Additional verification: Query Netcash API to confirm payment status
      // In production, you would call Netcash's verification endpoint
      return params.status === 'ACCEPTED' || params.status === 'PAID';
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Query payment status from Netcash
   */
  async queryPaymentStatus(requestId: string): Promise<{
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    amount?: number;
    reference?: string;
  }> {
    try {
      // In production, call Netcash query API
      // For now, return mock data
      console.log('Querying payment status for:', requestId);

      return {
        status: 'PENDING'
      };
    } catch (error) {
      console.error('Payment status query error:', error);
      throw new AppError('Failed to query payment status', 500);
    }
  }

  /**
   * Generate QR code for payment
   */
  private async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `NCR${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }

  /**
   * Generate security hash for payment verification
   */
  private generateHash(...params: string[]): string {
    const data = params.join('|') + '|' + this.serviceKey;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Process refund
   */
  async processRefund(params: {
    transactionId: string;
    amount: number;
    reason: string;
  }): Promise<boolean> {
    try {
      // In production, call Netcash refund API
      console.log('Processing refund:', params);

      return true;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw new AppError('Failed to process refund', 500);
    }
  }
}
