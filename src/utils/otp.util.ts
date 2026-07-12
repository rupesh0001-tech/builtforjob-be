import { randomInt } from 'crypto';

export function generateOTPCode(): string {
  // crypto.randomInt is cryptographically secure — safe for OTP generation
  return randomInt(100000, 1000000).toString();
}
