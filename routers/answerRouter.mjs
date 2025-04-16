import { Router } from "express";
import connectionPool from "../utils/db.mjs"
import { validationVote } from "../middlewares/vote.validation.mjs";

const answerRouter = Router();

answerRouter.post("/:answerId/vote", [validationVote], async (req, res) => {
    const answerIdFromClient = req.params.answerId;
    const vote = Number(req.body.vote);
  
    let result;
    try {
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
      console.error("Database error in /answers/:answerId/vote:", err);
      return res.status(500).json({
        message: "Unable to vote question."
      });
    };
    return res.status(200).json({
      message: "Vote on the answer has been recorded successfully."
    });
  });

  export default answerRouter;