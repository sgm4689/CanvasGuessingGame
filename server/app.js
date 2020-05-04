const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf');
const redis = require('redis');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURL = 'mongodb://heroku_7r4qth7g:ia1ks2nh739j153rgnqvodftk6@ds151007.mlab.com:51007/heroku_7r4qth7g' || 'mongodb://localhost/DomoMaker';

const mongooseOptions = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};


const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const newConnection = (socket) => {
  console.log('a user connected');

  socket.on('mouse', (data) => {
    socket.broadcast.emit('mouse', data);
    console.log(data);
  });

  socket.on('mouseUp', (data) => {
    socket.broadcast.emit('mouseUp', data);
    console.log(data);
  });

  socket.on('mouseDown', (data) => {
    socket.broadcast.emit('mouseDown', data);
    console.log(data);
  });

  socket.on('mouseOut', (data) => {
    socket.broadcast.emit('mouseOut', data);
    console.log(data);
  });

  socket.on('lineWidth', (data) => {
    socket.broadcast.emit('lineWidth', data);
    console.log(data);
  });

  socket.on('strokeStyle', (data) => {
    socket.broadcast.emit('strokeStyle', data);
    console.log(data);
  });

  socket.on('clear', (data) => {
    socket.broadcast.emit('clear', data);
    console.log(data);
  });

  socket.on('refresh', (data) => {
    io.sockets.emit('refresh', data);
  });

  socket.on('disconnect', (data) => {
    console.log('user disconnected');
  });
};

mongoose.connect(dbURL, mongooseOptions, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// Local redis var
// let redisURL = {
//   hostname: 'redis-15969.c9.us-east-1-2.ec2.cloud.redislabs.com',
//   port: 15969,
// };

let redisURL = {
  hostname: 'redis://rediscloud:AAs7yX0JG23Uikx0fwhaATkBqtndbM5h@redis-15371.c10.us-east-1-4.ec2.cloud.redislabs.com',
  port: 15371,
};

let redisPASS = 'R7Ixr8hncZuBOEO4NRWNOCU4XlAlZPe3';
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);

  [, redisPASS] = redisURL.auth.split(':');
}
const redisClient = redis.createClient({
  host: redisURL.hostname,
  port: redisURL.port,
  password: redisPASS,
});

const router = require('./router.js');

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: 'Domo Arigato',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token');
  return false;
});

router(app);

io.sockets.on('connection', newConnection);

http.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
