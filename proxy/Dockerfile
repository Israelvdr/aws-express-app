FROM public.ecr.aws/nginx/nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf

ENV CERT_PATH=/etc/nginx/certificates
ENV CERT_NAME=proxy.express-app.com
RUN mkdir -p $CERT_PATH
# COPY certificates/ $CERT_PATH/

# Install openssl, generate certs, and remove openssl again
RUN apk -U add openssl
RUN openssl req -new -x509 -days 365 -nodes -text -out $CERT_PATH/$CERT_NAME.crt \
  -keyout $CERT_PATH/$CERT_NAME.key -subj "/CN=psql-db"
RUN apk del openssl


RUN chmod 755 $CERT_PATH
RUN chmod 640 $CERT_PATH/$CERT_NAME.key
RUN chmod 640 $CERT_PATH/$CERT_NAME.crt

# Set environment variables for dynamic configuration
# Doesn't work right now.
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

EXPOSE 80