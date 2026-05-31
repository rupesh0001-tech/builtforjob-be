import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || 're_FxX2XbHu_CwUikwEimpy1a9zQmZRqMCQi';
const resend = new Resend(apiKey);

async function run() {
  console.log('Initializing Resend domain script...');
  
  // 1. List existing domains
  console.log('\n--- Listing Existing Domains ---');
  try {
    const listResponse = await resend.domains.list();
    console.log('Existing domains:', JSON.stringify(listResponse, null, 2));
  } catch (err: any) {
    console.error('Failed to list domains:', err.message);
  }

  // 2. Create the new domain: help.rupeshhh.in
  const domainName = 'help.rupeshhh.in';
  console.log(`\n--- Creating Domain: ${domainName} ---`);
  try {
    const createResponse = await resend.domains.create({ name: domainName });
    console.log('Create Response:', JSON.stringify(createResponse, null, 2));
  } catch (err: any) {
    console.error(`Failed to create domain ${domainName}:`, err.message);
  }

  // 3. List domains again to check verification status and DNS records
  console.log('\n--- Listing Domains (Updated) ---');
  try {
    const listResponse = await resend.domains.list();
    console.log('Updated domains:', JSON.stringify(listResponse, null, 2));
  } catch (err: any) {
    console.error('Failed to list domains after creation:', err.message);
  }
}

run();
