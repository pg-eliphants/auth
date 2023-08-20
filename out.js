import PG from "pg";
function login_nossl_nopassword() {
  return new PG.Client({
    host: "localhost",
    port: 5432,
    database: "auth_db",
    user: "role_ssl_passwd",
    password: "role_ssl_passwd",
    ssl: {
      rejectUnauthorized: false
    }
    // will crash backend for some reason binary: true,
  });
}
async function testConnection(connection) {
  const cl = connection();
  await cl.connect();
  {
    const rows = await cl.query({
      text: "PREPARE fooplanx (varchar) AS select oid, typname from pg_type where typname = $1"
    });
    console.log("prepare plan rows: [%o]", rows);
  }
  await new Promise((resolve) => setTimeout(resolve, 3e3));
  {
    const rows = await cl.query({
      text: "select * from pg_prepared_statements"
    });
    console.log("query pg_prepared_statements: [%o]", rows);
  }
  await new Promise((resolve) => setTimeout(resolve, 3e3));
  {
    const rows = await cl.query({
      text: "execute fooplanx('bool')"
    });
    console.log("query result: [%o]]", rows);
  }
}
testConnection(login_nossl_nopassword);
//# sourceMappingURL=out.js.map
