A basic express.js web app for the purposes of learning AWS.

Based on [templates](https://github.com/ExamProCo/TheFreeAWSDeveloperAssociate/tree/master/study-sync-000) and content from Andrew Brown and his [AWS DVA-C02 course](https://www.exampro.co/dva-c02).

Update: v2.2 has added an NGINX reverse proxy.

Update: v2.1 has introduced a major overhaul to the full express framework and project structure.

Several security features have implemented to harden the application (although more are still required).

Several other reliability and code quality features have been implemented including dependency injection, general structure improvements, and general code quality improvements.


Prerequisites:
- Docker
- Docker compose
- Node.js
- npm


Setup to run directly via CLI with npm, or in VSCode.
Built for linux.


To setup:
- Modify .env with your desired settings.
- Generate keys for the app and db in their respective certificates directories.
    - You can do this with (remember to change [NAME] for the appropriate services):
        ```
        openssl req -x509 -out [NAME].crt -keyout [NAME].key \
        -newkey rsa:2048 -nodes -sha256 \
        -subj '/CN=[NAME]' -extensions EXT -config <( \
        printf "[dn]\nCN=[NAME]\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
        ```
    - I recommend installing the app certificate (.crt file) as a tructed certificate in your browser.
    - Alternatively, uncomment the lines in the two Dockerfiles that generate the certs. However, this may cause issues with browsers showing the app as untrusted due to self-signed certificates. This will also prevent debugging and running without Docker.
    - Note: I may build a script to do this at some point.
- Run `npm install` from the express-app directory if running without Docker.

The PostgreSQL db will be setup and initialised (if not already) when the application is run using the below methods.
It will also be stopped when the application terminates gracefully.


To run:
- Via VSCode debugger:
    - Select "Debug express-app bare: ephemeral db" from the debug launch menu. This should be the default setting.
    - Press F5, or click run from the debug menu.
    - A browser window will automatically open to the appropriate port for the server.
    - Press Shift+F5, or click stop to stop.
    - The db and all related Docker networks, volumes, images, etc. will be removed.
- Via Docker:
    - Run one of:
        - `docker compose up`
        - Compose up via the Docker container tools VSCode extension for compose.yml or compose.debug.yml.
        - Run the "docker compose up" or "docker compose up: debug" VSCode tasks.
    - To terminate, run compose down using any of the above methods. Note that some of these support full cleanup of images and volumes and some do not.