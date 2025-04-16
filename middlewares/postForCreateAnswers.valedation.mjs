export const validationPostForCreateAnswers = (req, res, next) => {
    const { content } = req.body;
  
    if(!content){
      return res.status(400).json({
        message: "Invalid request data. Answer is required"
      });
    };
   
    if(content.length > 300) {
      return res.status(400).json({
        message: "Answer must not exceed 300 characters. "
      });
    };
  next();
};