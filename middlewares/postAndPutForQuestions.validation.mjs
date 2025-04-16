export const validationPostAndPutForQuestions = (req, res, next) => {
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
  next();
}