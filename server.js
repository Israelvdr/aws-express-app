require('dotenv').config();

const express = require('express');
const { Client } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

function terminate() {
  try {
    console.log("Shutting down gracefully...")
    console.log("Closing db connection.");
    db_client.end();
    console.log("Closing server ports.")
    server.close(() => {
      debug('HTTP server closed')
    })
    process.exitCode = 0
  } catch (err) {
    console.log("Graceful shutdown failed.")
    console.log(err);
    process.exitCode = 1
  }
}

// Queries
async function get_questions(db_client) {
  return await db_client.query(
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

async function get_next_question(db_client) {
  result = await db_client.query(
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

async function create_answer(db_client, question_id, choice) {
  return await db_client.query(
    `INSERT INTO ANSWERS (question_id, choice) 
      VALUES ('${question_id}','${choice}')`
  )
}

async function validate_answer(db_client, question_id, choice) {
  result = await db_client.query(
    `SELECT correct_answer
      FROM questions
      WHERE id = '${question_id}'`
  )
  return result.rows[0] === choice
}

async function get_progress(db_client) {
  answer_count = await db_client.query(
    `SELECT COUNT(*)
    FROM answers`
  )
  question_count = await db_client.query(
    `SELECT COUNT(*)
    FROM questions`
  )
  score = await db_client.query(
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

async function reset_answers(db_client) {
  return await db_client.query(`TRUNCATE answers`)
}

// Initialisation & setup functions
function init_app(db_client) {
  app.use(express.json());

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
  })
  app.use(express.static('public'))

  app.get('/questions', async (req, res) => {
    try {
      ;
      const questions = await get_questions(db_client)
      res.json(questions.rows)
    } catch (err) {
      console.log(err)
      res.status(500).send('Error retrieving questions')
    }
  });
  app.get('/questions/next', async (req, res) => {
    try {
      ;
      const question = await get_next_question(db_client)
      res.json(question)
    } catch (err) {
      console.log(err)
      res.status(500).send('Error retrieving next question')
    }
  });

  app.get('/progress', async (req, res) => {
    try {
      ;
      const progress = await get_progress(db_client)
      res.json(progress)
    } catch (err) {
      console.log(err)
      res.status(500).send('Error retrieving progress')
    }
  });

  app.post('/answers', async (req, res) => {
    try {
      const question_id = req.body.question_id
      const choice = req.body.choice
      await create_answer(db_client, question_id, choice)
      const is_correct = await validate_answer(db_client, question_id, choice)
      res.json(is_correct)
    } catch (err) {
      console.log(err)
      res.status(500).send('Error answering question')
    }
  })

  app.post('/reset', async (req, res) => {
    try {
      await reset_answers(db_client)
      res.status(204).send()
    } catch (err) {
      console.log(err)
      res.status(500).send('Error resetting answers')
    }
  })

  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })

  return server
}
function init_db() {
  // Get db env
  require('dotenv').config({ path: "./psql-db/.env" });
  const db_user = process.env.POSTGRES_USER;
  const db_password = process.env.POSTGRES_PASSWORD;
  const db_name = process.env.POSTGRES_DB;
  const db_url = process.env.DATABASE_URL;
  const connection_string = `postgresql://${db_user}:${db_password}@${db_url}/${db_name}`;

  const client = new Client({
    connectionString: connection_string,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    client.connect();
    return client;
  } catch (err) {
    console.log("Failed to connect to db.")
    console.log(err)
    return null
  }
}

function init_shutdown_handler(server) {
  process.on('SIGINT', (signal) => {
    console.log('SIGINT signal received: closing HTTP server.')
    terminate();
  })
  process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server.')
    terminate();
  })

  const io = require('socket.io')(server);
  io.on('connection', (socketServer) => {
    socketServer.on('npmStop', () => {
      console.log('Termination signal recieved.')
      terminate()
    });
  });

  return io;
}

function main() {
  const db_client = init_db()
  if (db_client === null) {
    return
  }
  server = init_app(db_client)
  io = init_shutdown_handler(server)
}

main()