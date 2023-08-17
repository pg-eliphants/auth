#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 <<EOSQL
CREATE ROLE role_nossl_nopasswd WITH NOINHERIT LOGIN PASSWORD NULL;
CREATE ROLE role_nossl_passwd WITH NOINHERIT LOGIN PASSWORD 'role_nossl_passwd';
CREATE ROLE role_ssl_nopasswd WITH NOINHERIT LOGIN PASSWORD NULL;
CREATE ROLE role_ssl_passwd WITH NOINHERIT LOGIN PASSWORD 'role_ssl_passwd';
EOSQL