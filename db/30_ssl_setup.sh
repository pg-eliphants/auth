
#!/bin/bash
set -eux;

cp /docker-entrypoint-initdb.d/server.crt ${PGDATA}/server.crt
cp /docker-entrypoint-initdb.d/server.key ${PGDATA}/server.key
cp /docker-entrypoint-initdb.d/ca.crt ${PGDATA}/ca.crt

chmod 600 ${PGDATA}/server.crt ${PGDATA}/server.key ${PGDATA}/ca.crt
chown postgres ${PGDATA}/server.crt ${PGDATA}/server.key ${PGDATA}/ca.crt

cat << EOF >> ${PGDATA}/postgresql.conf
ssl = on
ssl_cert_file = './server.crt'
ssl_key_file = './server.key' 
ssl_ca_file = './ca.crt'
ssl_ecdh_curve = 'prime256v1'
EOF
