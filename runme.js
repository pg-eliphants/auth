import PG from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
function login() {
  return new PG.Client({
    port: 5432,
    database: "auth_db",
    user: "role_ssl_nopasswd",
    ssl: {
      ca: readFileSync(resolve("./certs/ca.crt")),
    },
    // will crash backend for some reason binary: true,
  });
}
function delay(ts_in_sec) {
  const ts_in_ms = Math.trunc(ts_in_sec * 1e3);
  return new Promise((resolve2) => setTimeout(resolve2, ts_in_ms));
}
async function testConnection(connection) {
  const cl = connection();
  await cl.connect();
  {
    const rows = await cl.query({
      name: "foobar",
      //portal: "foobar",
      text: "select oid, typname from pg_type where typname = $1",
      values: ["bool"],
    });
  }
  await delay(3);
  {
    const result = await cl.query({
      text: "select * from pg_prepared_statements",
    });
    console.log("query pg_prepared_statements fields: [%o]", result.fields);
    console.log("query pg_prepared_statements rows: [%o]", result.rows);
  }
}
testConnection(login);
