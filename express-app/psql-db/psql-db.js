const { Client } = require('pg');

module.exports = class Postgres_DB {
    constructor(connection_string) {
        this.client = new Client({
            connectionString: connection_string,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }

    connect() {
        this.client.connect()
    }

    disconnect(){
        this.client.end()
    }

    async get_questions() {
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
        return await this.client.query(
            `INSERT INTO ANSWERS (question_id, choice) 
            VALUES ('${question_id}','${choice}')`
        )
    }

    async validate_answer(question_id, choice) {
        var result = await this.client.query(
            `SELECT correct_answer
            FROM questions
            WHERE id = '${question_id}'`
        )
        return result.rows[0] === choice
    }

    async get_progress() {
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
        return await this.client.query(`TRUNCATE answers`)
    }
}