const { Client } = require('pg');
const uuid = require('uuid')
const EventEmitter = require('events');

module.exports = class Postgres_DB {
    constructor({
        db_url,
        db_port,
        db_name,
        db_user,
        db_password,
        retry_delay,
        max_retries
    }) {
        this.retries = 0;
        this.retry_delay = retry_delay || 5000; // 5 seconds
        this.max_retries = max_retries || 5;
        this.config = {
            host: db_url || 'localhost', // Default to localhost if not set
            port: db_port || 5432, // Default to 5432 if not set
            database: db_name,
            user: db_user,
            password: db_password,
            ssl: {
                rejectUnauthorized: false // For local development, set to true in production
            }
        }
        this.client = new Client(this.config);
        this.connect();
        return this;
    }

    new_client() {
        if (this.client._connected){
            this.client.end();
        }
        this.client = new Client(this.config);
        this.retries = 0; // Reset retries
        this.connect();
        return this;
    }

    async connect() {
        if (this.client._connected) {
            return this;
        }
        do {
            try {
                await this.client.connect()
                this.client.emit('connected');
                console.debug("Postgres connected successfully");
                return this
            } catch (err){
                this.retries++;
                if (this.retries >= this.max_retries) {
                    console.error("Postgres connection failed after maximum retries");
                    throw err; // Rethrow the error after max retries
                }
                
                console.error(err);
                console.error(`Postgres connection failed, retrying (${this.retries}/${this.max_retries})...`);

                await new Promise(resolve => setTimeout(resolve, this.retry_delay));

                // Can't re-use clients
                // Don't use new Client() here as it resets retry count
                this.client = new Client(this.config); 
            }
        } while (!this.client._connected && this.retries < this.max_retries);

        // If we reach here, it means something went very wrong
        throw new Error("Uknown state: Postgres connection failed");
    }

    disconnect() {
        if (!this.client._connected){
            return this; // Already disconnected
        }
        this.client.end();
        console.debug("Postgres disconnected successfully");
        return this
    }

    async get_questions() {
        // Wait for the connection to be establishedn't already
        if (!this.client._connected) {
            await timeout_promise(10000, (resolve) => {
                this.client.once('connected', resolve);
            });
        }

        return await this.client.query(
            `SELECT
                id,
                question,
                json_build_array(
                    option_a,
                    option_b,
                    option_c,
                    option_d) as options
                FROM questions`
        )
    }

    async get_next_question() {
        // Wait for the connection to be establishedn't already
        if (!this.client._connected) {
            await timeout_promise(10000, (resolve) => {
                this.client.once('connected', resolve);
            });
        }

        var result = await this.client.query(
            `SELECT 
                id,
                question,
                json_build_array(
                    option_a,
                    option_b,
                    option_c,
                    option_d) as options
            FROM
                (SELECT
                *,
                random() as rand  
                FROM questions
                WHERE id NOT IN
                (SELECT question_id FROM answers)
                ORDER BY rand
                LIMIT 1)`
        )
        if (result.rows.length === 0) {
            return null
        }
        return result.rows[0]
    }

    async create_answer(question_id, choice) {
        // Wait for the connection to be establishedn't already
        if (!this.client._connected) {
            await timeout_promise(10000, (resolve) => {
                this.client.once('connected', resolve);
            });
        }

        // Validate; will pass up error if it occurs.
        validate_answer_params(question_id, choice);
        return await this.client.query(
            `INSERT INTO ANSWERS (question_id, choice) 
            VALUES ('${question_id}','${choice}')`
        )
    }

    async validate_answer(question_id, choice) {
        // Wait for the connection to be establishedn't already
        if (!this.client._connected) {
            await timeout_promise(10000, (resolve) => {
                this.client.once('connected', resolve);
            });
        }

        // Validate; will pass up error if it occurs.
        validate_answer_params(question_id, choice);
        var result = await this.client.query(
            `SELECT correct_answer
            FROM questions
            WHERE id = '${question_id}'`
        )
        return result.rows[0] === choice
    }

    async get_progress() {
        // Wait for the connection to be establishedn't already
        if (!this.client._connected) {
            await timeout_promise(10000, (resolve) => {
                this.client.once('connected', resolve);
            });
        }

        var answer_count = await this.client.query(
            `SELECT COUNT(*)
            FROM answers`
        )
        var question_count = await this.client.query(
            `SELECT COUNT(*)
            FROM questions`
        )
        var score = await this.client.query(
            `SELECT COUNT(*)
            FROM answers as a
            LEFT JOIN questions as q
            ON a.question_id = q.id
            WHERE a.choice=q.correct_answer`
        )
        return {
            answer_count: answer_count.rows[0].count,
            score: score.rows[0].count,
            question_count: question_count.rows[0].count
        }
    }

    async reset_answers() {
        // Wait for the connection to be establishedn't already
        if (!this.client._connected) {
            await timeout_promise(10000, (resolve) => {
                this.client.once('connected', resolve);
            });
        }

        return await this.client.query(`TRUNCATE answers`)
    }
}

function validate_choice(choice) {
    if (['A', 'B', 'C', 'D'].indexOf(choice) === -1) {
        throw new Error("invalid choice");
    }
}

function validate_uuid(id) {
    try {
        uuid.parse(id);
    } catch {
        // Catch error and throw different error
        // more relevant to our context.
        throw new Error("invalid id");
    }
}

function validate_answer_params(question_id, choice) {
    // Functions will throw error if invalid,
    // no need to catch; they wwill be passed up.
    validate_choice(choice);
    validate_uuid(question_id);
}

function timeout_promise(timeout, callback) {
    return new Promise((resolve, reject) => {
        // Set up the timeout
        const timer = setTimeout(() => {
            reject(new Error(`Promise timed out after ${timeout} ms`));
        }, timeout);

        // Set up the real work
        callback(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (error) => {
                clearTimeout(timer);
                reject(error);
            }
        );
    });
}