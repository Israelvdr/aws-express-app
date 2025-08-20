FROM postgres:17.6-alpine3.22

# Add certs and cert directory
RUN mkdir /var/lib/postgresql/certs

# Install openssl, generate certs, and remove openssl again
RUN apk -U add openssl
RUN openssl req -new -x509 -days 365 -nodes -text -out /var/lib/postgresql/certs/psql-db.crt \
  -keyout /var/lib/postgresql/certs/psql-db.key -subj "/CN=psql-db"
RUN apk del openssl

# Set appropriate cert permissions
RUN chown 70:70 /var/lib/postgresql/certs && chmod 755 /var/lib/postgresql/certs

RUN chown 0:70 /var/lib/postgresql/certs/psql-db.key && chmod 640 /var/lib/postgresql/certs/psql-db.key
RUN chown 0:70 /var/lib/postgresql/certs/psql-db.crt && chmod 640 /var/lib/postgresql/certs/psql-db.crt

# Add DB Initialisation
COPY /docker-entrypoint-initdb.d/* /docker-entrypoint-initdb.d

ENTRYPOINT ["docker-entrypoint.sh"] 

# Set config
CMD ["-c","ssl=on",\
    "-c","ssl_cert_file=/var/lib/postgresql/certs/psql-db.crt",\
    "-c","ssl_key_file=/var/lib/postgresql/certs/psql-db.key"]
