import Joi from "joi";

export function validateId(userId) {
  const schema = Joi.objectId().hex().length(24).required();
  return schema.validate(userId);
}
