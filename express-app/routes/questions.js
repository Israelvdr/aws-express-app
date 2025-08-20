module.exports = function router_with_db(db_client){
    var express = require('express');
    var router = express.Router();

    router.get('/', async (req, res) => {
        try {
            ;
            const questions = await db_client.get_questions()
            res.json(questions.rows)
        } catch (err) {
            console.log(err)
            res.status(500).send('Error retrieving questions')
        }
    });
    router.get('/next', async (req, res) => {
        try {
            ;
            const question = await db_client.get_next_question()
            res.json(question)
        } catch (err) {
            console.log(err)
            res.status(500).send('Error retrieving next question')
        }
    });

    return router
}