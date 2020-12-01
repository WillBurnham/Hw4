const Pool = require('pg').Pool;

const pool = new Pool({
  host: 'code.cs.uh.edu',
  user: 'cosc0229',
  password: '1823736BW',
  port: 5432,
  database: 'COSC3380'
});

module.exports = pool;