const { body, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports = {
  validateRegister: validate([
    body("username")
      .notEmpty()
      .withMessage("username is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("email").isEmail(),
    body("phoneNumber").notEmpty(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Minimum password length is 8 characters")
      .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).*$/)
      .withMessage(
        "Password must contain at least 1 number, 1 symbol, and 1 uppercase letter"
      )
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          return false;
        }
        return true;
      })
      .withMessage("Confirm password does not match with password"),
  ]),
  validateResetPass: validate([
    body("token").notEmpty().withMessage("token is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Minimum password length is 8 characters")
      .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).*$/)
      .withMessage(
        "Password must contain at least 1 number, 1 symbol, and 1 uppercase letter"
      )
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          return false;
        }
        return true;
      })
      .withMessage("Confirm password does not match with password"),
  ]),
  validateChangePass: validate([
    body("oldpassword")
      .isLength({ min: 8 })
      .withMessage("Minimum password length is 8 characters")
      .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).*$/)
      .withMessage(
        "Password must contain at least 1 number, 1 symbol, and 1 uppercase letter"
      )
      .withMessage("confirm password does not match with password"),
  ]),
  validateUpdate: validate([
    body("email").isEmail().withMessage("email must be valid"),
    body("username")
      .notEmpty()
      .withMessage("username is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("phoneNumber")
      .notEmpty()
      .withMessage("phone number must not be empty"),
  ]),
};
