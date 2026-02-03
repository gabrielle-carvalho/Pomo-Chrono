const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool ({ // Pra gerenciar multiplas conexaoes pra melhor performance
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () =>{
    console.log('connected with postgresql sucessfully')
});

module.exports = pool;

