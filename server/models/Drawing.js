const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let DrawingModel = {};

// Converts string to mongo ID
const convertId = mongoose.Types.ObjectId;
const setWord = (word) => _.escape(word).trim();
const setImg = (img) => _.escape(img);

// not yet implemented
const DrawingSchema = new mongoose.Schema({
  word: {
    type: String,
    trim: true,
    required: true,
    set: setWord,
  },

  img: {
    type: String,
    required: true,
    set: setImg,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },
});

DrawingSchema.statics.toAPI = (doc) => ({
  word: doc.word,
  img: doc.img,
});

DrawingSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return DrawingModel.find(search).select('word img').lean().exec(callback);
};

DrawingModel = mongoose.model('Drawing', DrawingSchema);

module.exports.DrawingModel = DrawingModel;
module.exports.DrawingSchema = DrawingSchema;
