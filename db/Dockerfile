FROM postgres:latest
RUN mkdir -p /data/authentication
RUN chown -R postgres:postgres /data/authentication
USER postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV PGDATA=/var/lib/postgresql/data/pgdata
# workdir is var lib postgres
COPY ./00_db_create_auth_schema.sh /docker-entrypoint-initdb.d




