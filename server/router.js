const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  // app.get('/getImg', mid.requiresLogin, controllers.Domo.getImg);Not yet implemented
  app.post('/img', mid.requiresLogin, controllers.Drawing.make);
  app.post('/word', mid.requiresLogin, controllers.Words.checkWord);
  app.get('/word', mid.requiresLogin, controllers.Words.getWord);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Drawing.makerPage);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
