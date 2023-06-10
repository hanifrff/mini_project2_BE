module.exports = {
  async register(req, res) {
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
    try {
      // findAll akan mengembalikan ARRAY
      const data = await user.findAll({ where: { email: email } });
      console.log(data)
      if(data.length !== 0 ) {
        res.status(400).send({
          message: "error: email has already been taken",
        });
      }

      
    } catch (e) {
      // Lakukan error handling
    }

    // Lakukan insert
    try {
      await user.create({ username, email, phone, password });
      res.status(200).send({
        message: "succsess",
      });
      return;
    } catch (e) {
      res.status(500).send({
        message: "fail",
        error: e,
      });
    }
  },
};
