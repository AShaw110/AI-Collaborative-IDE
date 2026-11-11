const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    language: {
      type: String,
      default: 'javascript',
      trim: true
    },
    codeContent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'rooms'
  }
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
