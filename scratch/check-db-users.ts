import prisma from '../src/config/database/db';

async function run() {
  const emails = ['rupeshmhtcet@gmail.com', 'rupeshcoding01@gmail.com', 'rupeshwillbepro@gmail.com'];
  for (const email of emails) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(`User ${email}:`, user ? { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl } : 'Not found');
  }
}

run();
