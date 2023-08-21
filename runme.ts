import PG from "pg";

function login_nossl_nopassword() {
  return new PG.Client({
    host: "localhost",
    port: 5432,
    database: "auth_db",
    user: "role_ssl_passwd",
    password: "role_ssl_passwd",
    ssl: {
      rejectUnauthorized: false,
    },
    // will crash backend for some reason binary: true,
  });
}

const query1 = {
  text: "PREPARE fooplanx (varchar) AS select oid, typname from pg_type where typname = $1",
};

const query2 = {
  text: "select * from pg_prepared_statements",
};

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
      text: "select oid, typname from pg_type where typname = $1",
      values: ["bool"],
    });
    console.log("prepare plan rows: [%o]", rows);
  }
  await delay(3);
  {
    const rows = await cl.query({
      text: "select * from pg_prepared_statements",
    });
    console.log("query pg_prepared_statements: [%o]", rows);
  }
  /*await new Promise((resolve) => setTimeout(resolve, 3e3));
  {
    const rows = await cl.query({
      text: "execute foobar('bool')",
    });
    console.log("query result: [%o]]", rows);
  }*/
}

testConnection(login_nossl_nopassword);
