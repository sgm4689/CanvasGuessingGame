const models = require('../models');

const {
  Drawing,
} = models;

const makerPage = (req, res) => res.render('app', {
  csrfToken: req.csrfToken(),
});

const profilePage = (req, res) => res.render('profile', {
  csrfToken: req.csrfToken(),
  username: req.session.account.username,
});

const makeDrawing = (req, res) => {
  if (!req.body.img) {
    return res.status(404).json({
      error: 'An error occured',
    });
  }

  const DrawingData = {
    word: 'req.body.word', // words not implemented
    img: req.body.img,
    owner: req.session.account._id,
  };
  const newDrawing = new Drawing.DrawingModel(DrawingData);

  const DrawingPromise = newDrawing.save();

  DrawingPromise.then(() => res.json({
    redirect: '/profile',
  }));

  DrawingPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({
      error: 'An error occured',
    });
  });
  return DrawingPromise;
};

const getDrawings = (request, response) => {
  const req = request;
  const res = response;

  return Drawing.DrawingModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: 'An error occured',
      });
    }
    return res.json({
      Drawings: docs,
    });
  });
};

module.exports.makerPage = makerPage;
module.exports.profilePage = profilePage;
module.exports.make = makeDrawing;
module.exports.images = getDrawings;
module.exports.getDrawings = getDrawings;
