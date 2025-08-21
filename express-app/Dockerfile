FROM node:24-alpine3.21

# Setup working directory and app files
WORKDIR /app
COPY . .
RUN npm install

# Setup certs
# Add cert directory
# RUN mkdir certificates

# Install openssl, generate certs, and remove openssl again
# RUN apk -U add openssl
# RUN openssl req -new -x509 -days 365 -nodes -text -out certs/express-app.crt \
#   -keyout certs/express-app.key -subj "/CN=express-app"
# RUN apk del openssl

# Set appropriate cert permissions
# TODO: setup non-root user for server
RUN chmod 755 certificates
RUN chmod 640 certificates/express-app.key
RUN chmod 640 certificates/express-app.crt


CMD ["npm", "start"]