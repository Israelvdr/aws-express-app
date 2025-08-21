FROM public.ecr.aws/nginx/nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf

ENV CERT_PATH=/etc/nginx/certificates
RUN mkdir -p $CERT_PATH
COPY certificates/ $CERT_PATH/
RUN chmod 755 $CERT_PATH

ENV KEY_NAME=proxy.express-app.com
RUN chmod 640 $CERT_PATH/$KEY_NAME.key
RUN chmod 640 $CERT_PATH/$KEY_NAME.crt

# Set environment variables for dynamic configuration
# Doesn't work right now.
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

EXPOSE 80