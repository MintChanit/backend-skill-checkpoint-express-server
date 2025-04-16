import express, { json } from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/questions", async(req, res) => {
  let results;

  try{
    results = await connectionPool.query(
      `SELECT * FROM questions`
    );
  }catch(err){
    console.error("Database error in /questions", err);
    return res.status(500).json({
      message: "Unable to fetch questions."
    });
  };
  return res.status(200).json({
    data: results.rows
  });
});

app.get("/questions/search", async (req, res) => {
  const { title, category } = req.query;
  
  if (!title && !category) {
    return res.status(400).json({
      message: "Invalid search parameters."
    });
  };

  const whereClauses = [];
  const values = [];

  if (title) {
    whereClauses.push(`title ILIKE $${values.length + 1}`);
    values.push(`%${title}%`);
  };

  if (category) {
    whereClauses.push(`category ILIKE $${values.length + 1}`);
    values.push(`%${category}%`);
  }

  let query = `SELECT * FROM questions`;
  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  };

  let results;
  try {
   results = await connectionPool.query(query, values);
  }catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({
      message: "Unable to fetch a question."
    });
  };
  return res.status(200).json({
    data: results.rows,
  });
});

app.get("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  let result;

  try{
     //middleware: GET
     const questionCheck = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`, [questionIdFromClient]
    );

    if(questionCheck.rows.length === 0) {
      return res.status(404).json({
        message: `Question not found. (question id ${questionIdFromClient})`
      });
    };

    result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`, [questionIdFromClient]
    );

  }catch(err){
    console.error("Database error in /questions/questionId", err);
    return res.status(500).json({
      message: "Unable to fetch questions."
    });
  };
  return res.status(200).json({
    data: result.rows[0]
  });
});

app.get("/questions/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  let result;
  try{
    //middleware: GET
    const questionCheck = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`, [questionIdFromClient]
    );

    if(questionCheck.rows.length === 0) {
      return res.status(404).json({
        message: `Question not found. (question id ${questionIdFromClient})`
      });
    };

    result = await connectionPool.query(
      `SELECT * FROM answers WHERE question_id =$1`,
      [questionIdFromClient]
    );

  }catch (err) {
    console.error("Database error in /question/questionId/answers", err);
    return res.status(500).json({
      message: "Unable to fetch answers."
    });
  };
  return res.status(200).json({
    data: result.rows,
  });
});

app.post("/questions", async (req, res) => {

  try {
    const {title, description, category} = req.body
   
    if(!title) {
      return res.status(400).json({
        message: "Invalid request data. Title is required."
      });
    };

    if(!description) {
      return res.status(400).json({
        message: "Invalid request data. Description is required."
      });
    };

    if(!category) {
      return res.status(400).json({
        message: "Invalid request data. Category is required."
      });
    };

    await connectionPool.query(
      `
      INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3)
      `,
      [title, description, category]
    );

  } catch (err) {
    console.error("Database error in /questions", err);
    return res.status(500).json({
      message: "Unable to create question."
    });
  };
  return res.status(201).json({
    message: "Question created successfully."
  });
});

app.post("/questions/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;  
  const { content } = req.body;

  if(!content){
    return res.status(400).json({
      message: "Invalid request data. Answer is required"
    });
  };
  // middleware
  if(content.length > 300) {
    return res.status(400).json({
      message: "Answer must not exceed 300 characters. "
    });
  };

  let result;
  try{
    //middleware : POST
    const questionCheck = await connectionPool.query(
      `
      SELECT id FROM questions
      WHERE id = $1
      `,
      [questionIdFromClient]
    );

    if(questionCheck.rowCount === 0) {
      return res.status(404).json({
        message: `Question not found. (question id: ${questionIdFromClient})`
      })
    }
    result = await connectionPool.query (
      `
      INSERT INTO answers (content, question_id)
      VALUES ($1, $2)
      `, [content, questionIdFromClient]
    )
  }catch (err) {
    console.error("Database error in /questions/:questionId/answers:", err);
    return res.status(500).json({
      message: "Unable to create answers."
    });
  };
  return res.status(201).json({
    message: "Answer created successfully."
  });
});

app.post("/questions/:questionId/vote", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const vote = Number(req.body.vote);
  
  if(vote !== 1 && vote !== -1) {
    return res.status(400).json({
      message: "Invalid vote value."
    });
  };

  let result;
  try{
    //middleware : POST
    const questionCheck = await connectionPool.query(
      `
      SELECT id FROM questions
      WHERE id = $1
      `,
      [questionIdFromClient]
    );

    if(questionCheck.rowCount === 0) {
      return res.status(404).json({
        message: `Question not found. (question id: ${questionIdFromClient})`
      });
    };

    result = await connectionPool.query(
      `
      UPDATE questions
      SET votes = votes + $1
      WHERE id = $2
      `,
      [vote, answerIdFromClient]
    );

  }catch(err) {
    console.error("Database error in /questions/:questionId/answers:", err);
    return res.status(500).json({
      message: "Unable to vote question."
    });
  };
  return res.status(200).json({
     message: "Vote on the question has been recorded successfully."
  });
});

app.put("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const {title, description, category} = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      message: "Invalid request data."
    });
  };

  let result;
  try{
    //middleware : PUT
    const questionCheck = await connectionPool.query(
      `
      SELECT id FROM questions
      WHERE id = $1
      `,
      [questionIdFromClient]
    );

    if (questionCheck.rowCount === 0) {
      return res.status(404).json({
        message: `Question not found. (question id: ${questionIdFromClient})`
      });
    };

    result = await connectionPool.query(
      `
      UPDATE questions
      SET title = $2,
        description = $3,
        category = $4
      WHERE id = $1
      `, 
      [
        questionIdFromClient,
        title, 
        description,
        category,
      ]
    );

  }catch(err){
    console.error("Database error in /questions/:questionId", err);
    return res.status(500).json({
      message: "Unable to fetch questions."
    });
  };
  return res.status(200).json({
    message: "Question updated successfully."
  });
});

app.delete("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  let result;
  try {
    //middleware : DELETE
    const questionCheck = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`, 
      [questionIdFromClient]
    );

    if(questionCheck.rowCount === 0) {
      return res.status(404).json({
        message: `Question not found. (question id: ${questionIdFromClient})`
      });
    };

    result = await connectionPool.query(
      `
      DELETE FROM questions
      WHERE id = $1
      `, 
      [questionIdFromClient]
    )

  }catch(err){
    console.error("Database error in /questions/:questionId", err);
    return res.status(500).json({
      message: "Unable to delete question."
    });
  };
  return res.status(200).json({
    message: "Question post has been deleted successfully."
  });
});

app.delete("/questions/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  let result;
  try{
    //middleware : DELETE
    const questionCheck = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`, 
      [questionIdFromClient]
    );

    if(questionCheck.rowCount === 0) {
      return res.status(404).json({
        message: `Question not found. (question id: ${questionIdFromClient})`
      });
    };

    result = await connectionPool.query(
      `DELETE FROM answers WHERE question_id = $1`, 
      [questionIdFromClient]
    );

  }catch(err) {
    console.error("Database error in /questions/:questionId", err);
    return res.status(500).json({
      message: "Unable to delete answers."
    });
  };
  return res.status(200).json({
    message: "All answers for the question have been deleted successfully."
  });
});

app.post("/answers/:answerId/vote", async (req, res) => {
  const answerIdFromClient = req.params.answerId;
  const vote = Number(req.body.vote);

  if(vote !== 1 && vote !== -1){
    return res.status(400).json({
      message: "Invalid vote value."
    });
  };

  let result;
  try {
    //middleware : answers POST
    const answerCheck = await connectionPool.query(
      `SELECT * FROM answers WHERE id = $1`,
      [answerIdFromClient]
    )

    if(answerCheck.rowCount === 0) {
      return res.status(404).json({
        message: `Answer not found. (answer id: ${answerIdFromClient})`
      });
    };

    result = await connectionPool.query(
      `
      UPDATE answers
      SET votes = votes + $1
      WHERE id = $2
      `,
      [vote, answerIdFromClient]
    )
  }catch (err) {
    console.error("Database error in /questions/:questionId/answers:", err);
    return res.status(500).json({
      message: "Unable to vote question."
    });
  };
  return res.status(200).json({
    message: "Vote on the answer has been recorded successfully."
  });
});

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
