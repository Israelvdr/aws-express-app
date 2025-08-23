FROM node:24-alpine3.21

# Setup working directory and app files
WORKDIR /app
COPY . .
RUN npm install

ENV CERT_PATH=/app/certificates
ENV CERT_NAME=app.express-app.com

# Setup certs
# Add cert directory
RUN mkdir -p $CERT_PATH

# Install openssl, generate certs, and remove openssl again
# Install openssl, generate certs, and remove openssl again
RUN apk -U add openssl
RUN openssl req -new -x509 -days 365 -nodes -text -out $CERT_PATH/$CERT_NAME.crt \
  -keyout $CERT_PATH/$CERT_NAME.key -subj "/CN=psql-db"
RUN apk del openssl

# Set appropriate cert permissions
# TODO: setup non-root user for server
RUN chmod 755 $CERT_PATH
RUN chmod 640 $CERT_PATH/$CERT_NAME.key
RUN chmod 640 $CERT_PATH/$CERT_NAME.crt


CMD ["npm", "start"]