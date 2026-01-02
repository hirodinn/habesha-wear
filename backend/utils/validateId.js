import Joi from "joi";

export function validateId(userId) {
  const schema = Joi.objectId().required();
  return schema.validate(userId);
}
