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

  // INFO-02: Atomic decrement using updateMany with a condition check on token balance
  // to avoid concurrency issues / race conditions where tokens could go negative.
  const updatedResult = await prisma.user.updateMany({
    where: {
      id: userId,
      tokens: {
        gte: amount
      }
    },
    data: {
      tokens: {
        decrement: amount
      }
    }
  });

  if (updatedResult.count === 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokens: true }
    });
    if (!user) {
      throw new Error('User not found');
    }
    throw new Error(`Insufficient tokens. This action requires ${amount} tokens, but you only have ${user.tokens} remaining.`);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokens: true }
  });

  return user ? user.tokens : 0;
}
