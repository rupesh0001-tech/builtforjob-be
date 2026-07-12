const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET environment variable must be defined');
}

if (secret.length < 64) {
  throw new Error(
    'JWT_SECRET is too short. It must be at least 64 characters. ' +
    'Generate a secure one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
}

export const jwtConfig = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
