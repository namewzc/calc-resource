const Joi = require('joi');

const projectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  team: Joi.object({
    developers: Joi.number().min(0).required(),
    designers: Joi.number().min(0).required(),
    projectManagers: Joi.number().min(0).required(),
    testers: Joi.number().min(0).required()
  }).required(),
  features: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      complexity: Joi.string().valid('low', 'medium', 'high').required(),
      estimatedHours: Joi.number().min(0).required()
    })
  ).required()
});

function validateProjectInput(req, res, next) {
  const { error } = projectSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
}

module.exports = {
  validateProjectInput
}; 