import { Client } from 'node-postgres';


function login_nossl_nopassword(){
    return new Client({
        host: 'localhost',
        port: 5432,
        database: 'auth_db',
        user: 'role_nossl_nopasswd',
    });
}

async function testConnection(connection: () => Client) {
    // postgres[ql]://[username[:password]@][host[:port],]/database[?parameter_list]
    const cl = connection();
    await cl.connect();
    const rows = await cl.query('SELECT CURRENT_TIMESTAMP::text;');
    console.log('query result: [%o]]', rows);
}

testConnection(login_nossl_nopassword);