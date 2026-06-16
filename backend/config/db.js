const { Pool } = require('pg');
const pg = require('pg');
require('dotenv').config();

// Force node-postgres to parse TIMESTAMP (without timezone) as UTC
pg.types.setTypeParser(1114, function(stringValue) {
  if (!stringValue) return null;
  // If it already contains a timezone suffix, let standard parser handle it;
  // otherwise, replace space with T and append Z to parse as UTC.
  const isoStr = stringValue.replace(' ', 'T') + (stringValue.includes('Z') || stringValue.includes('+') ? '' : 'Z');
  return new Date(isoStr);
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
