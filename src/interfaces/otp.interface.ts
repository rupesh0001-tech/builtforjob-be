export interface IOTP {
  id: string;
  userId?: string;
  email: string;
  code: string;
  type: OTPType;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export enum OTPType {
  REGISTRATION = 'REGISTRATION',
  PASSWORD_RESET = 'PASSWORD_RESET'
}

export interface IOTPVerificationResult {
  isValid: boolean;
  message: string;
}
