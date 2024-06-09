#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 <<EOSQL
drop role if exists role_nossl_nopasswd;
CREATE ROLE role_nossl_nopasswd WITH NOINHERIT LOGIN PASSWORD NULL;
ALTER ROLE role_nossl_nopasswd SET search_path = auth;
drop role if exists role_nossl_passwd;
CREATE ROLE role_nossl_passwd WITH NOINHERIT LOGIN PASSWORD 'role_nossl_passwd';
drop role if exists role_ssl_nopasswd;
CREATE ROLE role_ssl_nopasswd WITH NOINHERIT LOGIN PASSWORD NULL;
drop role if exists role_ssl_passwd;
CREATE ROLE role_ssl_passwd WITH NOINHERIT LOGIN PASSWORD 'role_ssl_passwd';
EOSQL