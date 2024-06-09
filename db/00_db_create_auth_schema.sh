
#!/bin/bash

# auth_db=> select table_catalog, table_name, column_name, data_type, ordinal_position, is_identity, column_default, identity_generation from information_schema.columns where table_name = 'user';
#  table_catalog | table_name | column_name |          data_type          | ordinal_position | is_identity |  column_default   | identity_generation 
# ---------------+------------+-------------+-----------------------------+------------------+-------------+-------------------+---------------------
#  auth_db       | user       | id          | integer                     |                1 | YES         |                   | ALWAYS
#  auth_db       | user       | cr_ts       | timestamp without time zone |                2 | NO          | CURRENT_TIMESTAMP | 

#  SELECT *
# FROM information_schema.schemata;  -- schema public was deleted on purpose
#  catalog_name |    schema_name     | schema_owner  | default_character_set_catalog | default_character_set_schema | default_character_set_name | sql_path 
# --------------+--------------------+---------------+-------------------------------+------------------------------+----------------------------+----------
#  auth_db      | information_schema | postgres      |                               |                              |                            | 
#  auth_db      | pg_catalog         | postgres      |                               |                              |                            | 
#  auth_db      | pg_toast           | postgres      |                               |                              |                            | 
#  auth_db      | auth               | authenticator |                               |                              |                            | 

set -e

psql -v ON_ERROR_STOP=1 <<EOSQL
-- fail on the first error
\set ON_ERROR_STOP on

CREATE ROLE authenticator WITH NOINHERIT NOLOGIN;

CREATE DATABASE auth_db WITH CONNECTION LIMIT = -1;

\c auth_db

-- create a schema in the database "auth_db"

CREATE SCHEMA auth AUTHORIZATION authenticator;

ALTER ROLE authenticator SET search_path = auth;

-- also an index (pk_user) will be created with the same name as the constraint 
CREATE TABLE auth.user (
    id integer GENERATED ALWAYS AS IDENTITY (CACHE 500), -- CACHE 500 are sequence props, you can specifiy
    cr_ts timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user PRIMARY KEY (id)
);

-- moving table to new owner also moves sequence to new owner
-- "pg_indexes" does not have ownership information but can imagine this is moved to new owner aswell
alter table auth.user owner to authenticator;

CREATE TABLE auth.user_prop_types (
    type VARCHAR(4) NOT NULL CHECK (type = LOWER(type)),
    CONSTRAINT user_prop_types_pk
        PRIMARY KEY (type)
);

alter table auth.user_prop_types owner to authenticator;

CREATE TABLE auth.user_props (
    fk_user_id integer NOT NULL,
    fk_user_prop_types_type VARCHAR(10) NOT NULL,
    value VARCHAR(256) NOT NULL,
    cr_ts timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_props_fk
        FOREIGN KEY (fk_user_id) REFERENCES auth.user(id) ON DELETE CASCADE,
    CONSTRAINT user_props_types_type_fk    
     FOREIGN KEY (fk_user_prop_types_type) REFERENCES auth.user_prop_types(type) ON DELETE CASCADE
);

-- no schema prefix needed for indexes, dont remember anymore if this was true for oracle)
CREATE INDEX user_props_idx ON auth.user_props(type, fk_user_id);
CREATE INDEX user_props_idx2 ON auth.user_props(fk_user_id, type);

alter table auth.user_props owner to authenticator;

CREATE TABLE auth.tombstones (                              -- record entry = a tombstone instance
    fk_user_id integer NOT NULL,                            -- the user id you are tombstoning
    fk_user_prop_types_type VARCHAR(10) NOT NULL,           -- the prop type you are tombstoning
    cr_ts timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,     -- time of the tombstone
    CONSTRAINT user_props_fk_user_id
        FOREIGN KEY (fk_user_id) REFERENCES auth.user(id) ON DELETE CASCADE,
    CONSTRAINT user_props_fk_prop_type    
     FOREIGN KEY (fk_user_prop_types_type) REFERENCES auth.user_prop_types(type) ON DELETE CASCADE    
);

-- No schema prefix needed for indexes
CREATE INDEX tombstone_idx ON  auth.tombstones(fk_user_id, fk_user_prop_types_type);
CREATE INDEX tombstone_idx2 ON  auth.tombstones(fk_user_prop_types_type, fk_user_id);


CREATE TABLE auth.user_props_bin (
    fk_user_id integer NOT NULL,
    type VARCHAR(10) NOT NULL,
    value bytea NOT NULL,
    CONSTRAINT user_props_bin_fk
        FOREIGN KEY (fk_user_id) REFERENCES auth.user(id) ON DELETE CASCADE,
    CONSTRAINT user_props_bin_types_fk    
        FOREIGN KEY (type) REFERENCES auth.user_prop_types(type) ON DELETE CASCADE    
);

CREATE INDEX user_props_bin_idx ON auth.user_props_bin(UPPER(type), fk_user_id);
CREATE INDEX user_props_bin_idx2 ON auth.user_props_bin(fk_user_id, UPPER(type));

alter table auth.user_props_bin owner to authenticator;

--auth_db=# select schemaname, tablename, indexname, indexdef from pg_indexes view where schemaname = 'auth';
--  schemaname |    tablename    |      indexname      |                                               indexdef                                                
---------------+-----------------+---------------------+-------------------------------------------------------------------------------------------------------
--  auth       | user            | pk_user             | CREATE UNIQUE INDEX pk_user ON auth."user" USING btree (id)
--  auth       | user_prop_types | user_prop_types_pk  | CREATE UNIQUE INDEX user_prop_types_pk ON auth.user_prop_types USING btree (type)
--  auth       | user_props      | user_props_idx      | CREATE INDEX user_props_idx ON auth.user_props USING btree (upper((type)::text), fk_user_id)
--  auth       | user_props      | user_props_idx2     | CREATE INDEX user_props_idx2 ON auth.user_props USING btree (fk_user_id, upper((type)::text))
--  auth       | user_props_bin  | user_props_bin_idx  | CREATE INDEX user_props_bin_idx ON auth.user_props_bin USING btree (upper((type)::text), fk_user_id)
--  auth       | user_props_bin  | user_props_bin_idx2 | CREATE INDEX user_props_bin_idx2 ON auth.user_props_bin USING btree (fk_user_id, upper((type)::text))
EOSQL
