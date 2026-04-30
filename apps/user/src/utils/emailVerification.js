import { authService } from '@bhatbhati/shared/services/authService.js';

export async function resendVerificationEmail(email) {
  return authService.resendVerificationEmail(email);
}
