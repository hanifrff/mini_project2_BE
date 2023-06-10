const userModel = require("../models/user")


module.exports = {
  register(req, res) {
    const { username, email, phone, password, confirmPassword } = req.body;
    

    res.send({
      message: "succsess",
    });
  },
};
