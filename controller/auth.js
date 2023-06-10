module.exports = {
  register(req, res) {
    const { username, email, phone, password, confirmPassword } = req.body;
    const { user } = require("../models");

    // Lakukan check jika password dan confirmPassword, tidak sama
    if (password !== confirmPassword) {
      res.status(400).send({
        message: "error: password and confirm password is not equal",
      });
      return;
    }

    // Lakukan check: tidak ada email yang boleh sama
    // Lakukan select * from users where email = 'denoxet582@larland.com';
    // Lakukan user.findAll
    user
      .findAll({
        where: {
          email: email,
        },
      })
      .then((data) => {
        res.status(400).send({
          message: "error: email has already taken",
        });

        
      });

    // Lakukan insert
    user
      .create({ username, email })
      .then((data) => {
        res.send({
          message: "succsess",
        });
      })
      .catch((e) => {
        res.send({
          message: "fail",
        });
      });
  },
};
