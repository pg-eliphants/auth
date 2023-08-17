
#!/bin/bash
set -eux;

cp ${PGDATA}/pg_hba.conf ${PGDATA}/pg_hba.conf.backup

cat << EOF > ${PGDATA}/pg_hba.conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
#host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust

## hostnossl        database    user                    IP-address  IP-mask      auth-method  [auth-options]
hostnossl           auth_db     role_nossl_nopasswd     0.0.0.0/0   trust   
hostnossl           auth_db     role_nossl_passwd       0.0.0.0/0   password
hostssl             auth_db     role_ssl_nopasswd       0.0.0.0/0   trust  
hostssl             auth_db     role_ssl_passwd         0.0.0.0/0   password 
host all all all scram-sha-256
EOF
