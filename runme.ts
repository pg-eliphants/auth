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

function delay(ts_in_sec: number) {
  const ts_in_ms = Math.trunc(ts_in_sec * 1e3);
  return new Promise((resolve) => setTimeout(resolve, ts_in_ms));
}

async function testConnection(connection: () => PG.Client) {
  // postgres[ql]://[username[:password]@][host[:port],]/database[?parameter_list]
  const cl = connection();
  await cl.connect();
  {
    const rows = await cl.query({
      name: "foobar",
      //portal: "foobar",
      // types: [],
      text: "select oid::oid from pg_type where typname = $1::name",
      values: ["bool"],
      types4: [19], // oid type is "name", if you put 16 (boolean) type there will be an error
    });
    //console.log("prepare plan rows: [%o]", rows);
  }
  await delay(3);
  {
    const result = await cl.query({
      text: "select * from pg_prepared_statements",
    });
    console.log("query pg_prepared_statements fields: [%o]", result.fields);
    console.log("query pg_prepared_statements rows: [%o]", result.rows);
  }
  /*await new Promise((resolve) => setTimeout(resolve, 3e3));
  {
    const rows = await cl.query({
      text: "execute foobar('bool')",
    });
    console.log("query result: [%o]]", rows);
  }*/
}

testConnection(login);
