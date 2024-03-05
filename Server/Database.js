const { Client } = require('pg');

process.env.PGHOST = 'wrongly-cute-badger-iad.a1.pgedge.io';
process.env.PGUSER = 'admin';
process.env.PGDATABASE = 'ffssosp';
process.env.PGSSLMODE = 'require';
process.env.PGPASSWORD = '****************';

async function main() {
    const client = new Client();
    await client.connect();
}

main().catch(console.error);
