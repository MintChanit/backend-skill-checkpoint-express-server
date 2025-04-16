export const validationVote = (req, res, next) => {
    const vote = Number(req.body.vote);
      
        if(vote !== 1 && vote !== -1){
          return res.status(400).json({
            message: "Invalid vote value."
          });
        };
    next();
};
