import postgres from 'postgres';
import net from 'node:net';

// @ts-ignore
const sql = postgres({
    username: 'postgres',
    password: 'postgres',
    socket(options) {
        console.log('creating socket', options);
        // @ts-ignore
        return net.createConnection({ host: '0.0.0.0', port: 5432 });
    }
});

// @ts-ignore
console.log(sql.connections);
/*sql.connections.onchange = (...args) => {
    console.error(args);
};*/
// @ts-ignore

console.log(sql.connections);
// @ts-ignore
sql.connections.onchange = (...args) => {
    console.error(args);
};
try {
    // @ts-ignore
    const data = await sql`select * from pg_tables`.forEach((row, result) => {
        const { schemaname, tablename, tableowner } = row;
        console.log(`${schemaname}\t${tablename}\t${tableowner}`);
    });
    // @ts-ignore
    console.log(sql.connections.idle);
    // @ts-ignore
    console.log(sql.connections.open);
} catch (err) {
    console.log('err', err);
}
// @ts-ignore
console.log(sql.connections);
//console.log(data);
