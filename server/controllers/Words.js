const words = ['taco', 'burrito', 'Chili'];

const getRandomInt = (max) => {
  const num = Math.floor(Math.random() * Math.floor(max));
  return num;
};

// moved beneath getRandomInt to please eslint
let word = words[getRandomInt(words.length)];

const checkWord = (req, res) => {
  if (req.body.word === word) {
    word = words[getRandomInt(words.length)];
  }
  res.redirect('/word');// Redirect to getWord, so the client knows the word has changes
};


const getWord = (req, res) => {
  res.json({
    Word: word,
  });
};


module.exports.checkWord = checkWord;
module.exports.getWord = getWord;
