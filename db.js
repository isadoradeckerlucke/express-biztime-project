/** Database setup for BizTime. */

const {Client} = require('pg');

const client = new Client({
    connectionString: 'posgresql://biztime'
});

client.connect();

module.exports = client;