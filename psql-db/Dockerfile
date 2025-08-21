FROM postgres:17.6-alpine3.22

# Add certs and cert directory
ENV CERT_DIR=/var/lib/postgresql/certificates
RUN mkdir $CERT_DIR

ENV CERT_NAME=db.express-app.com
COPY certificates/$CERT_NAME.crt $CERT_DIR/$CERT_NAME.crt
COPY certificates/$CERT_NAME.key $CERT_DIR/$CERT_NAME.key

# Install openssl, generate certs, and remove openssl again
# RUN apk -U add openssl
# RUN openssl req -new -x509 -days 365 -nodes -text -out /var/lib/postgresql/certs/psql-db.crt \
#   -keyout /var/lib/postgresql/certs/psql-db.key -subj "/CN=psql-db"
# RUN apk del openssl

# Set appropriate cert permissions
RUN chown 70:70 $CERT_DIR && chmod 755 $CERT_DIR
RUN chown 0:70 $CERT_DIR/$CERT_NAME.key && chmod 640 $CERT_DIR/$CERT_NAME.key
RUN chown 0:70 $CERT_DIR/$CERT_NAME.crt && chmod 640 $CERT_DIR/$CERT_NAME.crt

# Add DB Initialisation
COPY /docker-entrypoint-initdb.d/* /docker-entrypoint-initdb.d

ENTRYPOINT ["docker-entrypoint.sh"] 

# Set config
CMD ["-c","ssl=on",\
    "-c","ssl_cert_file=/var/lib/postgresql/certificates/db.express-app.com.crt",\
    "-c","ssl_key_file=/var/lib/postgresql/certificates/db.express-app.com.key"]
