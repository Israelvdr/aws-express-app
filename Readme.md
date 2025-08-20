A basic express.js web app for the purposes of learning AWS.


Prerequisites:
- Docker
- Docker compose
- Node.js
- npm


Setup to run directly via CLI with npm, or in VSCode.
Built for linux.


To setup:
- Set your desired port in the root .env.
- Set your desired PostgreSQL username, password, and db name in the psql-db .env file.
- Run `npm install`.

The PostgreSQL db will be setup and initialised (if not already) when the application is run using the below methods.
It will also be stopped when the application terminates gracefully.


To run:
- Via npm:
    - Run `npm start` to start.
    - Run `npm stop` in a new terminal to stop.
- Via VSCode (with debugging):
    - Press F5, or click run from the debug menu.
    - A browser window will automatically open to the appropriate port for the server.
    - Press Shift+F5, or click stop to stop.