const words = ['taco', 'burrito', 'chili', 'house', 'sofa', 'running', 'mountain', 'mug', 'sponge', 'phone'];
let drawer;

const getRandomInt = (max) => {
  const num = Math.floor(Math.random() * Math.floor(max));
  return num;
};

// moved beneath getRandomInt to please eslint
let word = words[getRandomInt(words.length)];

const checkWord = (req, res) => {
  console.log(req.body.words);
  if (req.body.word === word) {
    drawer = req.session.account.username;
    word = words[getRandomInt(words.length)];
  }
  res.redirect('/word');// Redirect to getWord, so the client knows the word has changes
};


const getWord = (req, res) => {
  let value;
  if (req.session.account.username === drawer) {
    value = {
      Word: word,
      Drawer: drawer,
      Username: req.session.account.username,
      Correct: true,
    };
  } else if (!drawer) { // If there isn't a drawer yet, you get to be the first one
    drawer = req.session.account.username;
    value = {
      Word: word,
      Drawer: drawer,
      Username: req.session.account.username,
      Correct: true,
    };
  } else {
    value = {
      Word: '',
      Drawer: drawer,
      Username: req.session.account.username,
      Correct: false,
    };
  }
  console.log(drawer);
  res.json(value);
};

const ClearDrawer = (req, res) => {
  drawer = '';
  return res.json({
    redirect: '/profile',
  });
};


module.exports.clear = ClearDrawer;
module.exports.checkWord = checkWord;
module.exports.getWord = getWord;
