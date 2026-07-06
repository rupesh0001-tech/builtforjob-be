import prisma from '../config/db.config';

/**
 * Checks if the user is due for their monthly token refill.
 * If 30 days have passed since lastTokenReset, resets tokens to 10.0 and updates lastTokenReset.
 */
export async function checkAndRefreshTokens(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokens: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.tokens;
}

/**
 * Verifies and deducts tokens from a user's balance.
 * Returns the updated balance if successful, or throws an error if insufficient tokens.
 */
export async function deductTokens(userId: string, amount: number): Promise<number> {
  // First run the monthly refresh check to ensure they get refills first
  await checkAndRefreshTokens(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokens: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.tokens < amount) {
    throw new Error(`Insufficient tokens. This action requires ${amount} tokens, but you only have ${user.tokens} remaining.`);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      tokens: {
        decrement: amount
      }
    }
  });

  return updated.tokens;
}
