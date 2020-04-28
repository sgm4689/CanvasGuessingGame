const models = require('../models');

const {
  Account,
} = models;

const loginPage = (req, res) => {
  res.render('login', {
    csrfToken: req.csrfToken(),
  });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  // string casting
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({
      error: 'RAWR! All fields are required',
    });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({
        error: 'Wrong username or password',
      });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({
      redirect: '/profile',
    });
  });
};

const connect = (request, response) => {
  const res = response;

  return res.json({
    redirect: '/maker',
  });
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  // string casting
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({
      error: 'RAWR! All fields are required',
    });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({
      error: 'RAWR! Passwords do not match',
    });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({
        redirect: 'profile',
      });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({
          error: 'Username already in use.',
        });
      }

      return res.status(400).json({
        error: 'An error occured',
      });
    });
  });
};

const changePass = (request, response) => {
  const req = request;
  const res = response;

  // string casting
  req.body.newPass = `${req.body.oldPass}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.oldPass || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({
      error: 'All fields are required',
    });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({
      error: 'Passwords do not match',
    });
  }

  return Account.AccountModel.authenticate(
    req.session.account.username,
    req.body.oldPass,
    (err, account) => {
      if (err || !account) {
        return res.status(401).json({
          error: 'Wrong username or password',
        });
      }

      return res.json({
        redirect: 'profile',
      });
      ////*not implemented yet*
      // return Account.AccountModel.updatePass(
      //   req.session.account.username,
      //   req.body.pass,
      //   (err, account) => {
      //     if (err || !account) {
      //       return res.status(401).json({
      //         error: 'Wrong username or password',
      //       });
      //     }
      //
      //     return res.json({
      //       redirect: '/profile',
      //     });
      //   },
      // );
    },
  );
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports.loginPage = loginPage;
module.exports.changePass = changePass;
module.exports.connect = connect;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
