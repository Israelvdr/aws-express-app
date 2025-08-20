module.exports = function router_with_db(db_client){
    var express = require('express');
    var router = express.Router();

    router.get('/progress', async (req, res) => {
        try {
            ;
            const progress = await db_client.get_progress()
            res.json(progress)
        } catch (err) {
            console.log(err)
            res.status(500).send('Error retrieving progress')
        }
    });

    router.post('/', async (req, res) => {
        try {
            const question_id = req.body.question_id
            const choice = req.body.choice
            await db_client.create_answer(question_id, choice)
            const is_correct = await db_client.validate_answer(question_id, choice)
            res.json(is_correct)
        } catch (err) {
            console.log(err)
            res.status(500).send('Error answering question')
        }
    })

    router.post('/reset', async (req, res) => {
        try {
            await db_client.reset_answers()
            res.status(204).send()
        } catch (err) {
            console.log(err)
            res.status(500).send('Error resetting answers')
        }
    })

    return router;
}

