const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up project structure...\n');

// Create all folders
const folders = [
  'src',
  'src/config',
  'src/interfaces',
  'src/middlewares/auth',
  'src/middlewares/validation',
  'src/routes/user',
  'src/controllers/user',
  'src/services/email',
  'src/services/auth',
  'src/services/user',
  'prisma',
  '../docs',
  '../docs/backend',
  '../docs/backend/auth'
];

console.log('📁 Creating folders...');
folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`   ✓ ${folder}`);
  }
});

console.log('\n✅ All folders created successfully!');
console.log('\n📝 Next steps:');
console.log('   1. Run: bun install');
console.log('   2. Copy .env.example to .env and fill in values');
console.log('   3. Run: bun run db:generate');
console.log('   4. Run: bun run db:push');
console.log('   5. Run: bun run dev');
