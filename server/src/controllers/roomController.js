const Room = require('../models/Room');

/**
 * Fetches an existing room by roomId or initializes one with default editor state.
 */
const getOrCreateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'A valid roomId parameter must be supplied in the URL path.'
      });
    }

    const cleanRoomId = roomId.trim();
    const room = await Room.findOne({ roomId: cleanRoomId });

    if (room) {
      return res.status(200).json({
        success: true,
        message: 'Existing room retrieved successfully',
        room
      });
    }

    const newRoom = await Room.create({
      roomId: cleanRoomId,
      language: 'javascript',
      codeContent: '// Welcome to the Collaborative Code Editor!\n// Start coding here with your team in real time.\n'
    });

    return res.status(201).json({
      success: true,
      message: 'New room created successfully',
      room: newRoom
    });
  } catch (error) {
    console.error(`[roomController:getOrCreateRoom] Error: ${error.message}`);
    return next(error);
  }
};

/**
 * Persists partial updates (codeContent and/or language) for an existing room.
 */
const updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { codeContent, language } = req.body;

    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'A valid roomId parameter must be supplied in the URL path.'
      });
    }

    // Build partial update object so omitting one field does not overwrite it.
    const updateData = {};
    if (typeof codeContent === 'string') {
      updateData.codeContent = codeContent;
    }
    if (typeof language === 'string' && language.trim() !== '') {
      updateData.language = language.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body must contain codeContent (string) and/or language (string).'
      });
    }

    const updatedRoom = await Room.findOneAndUpdate(
      { roomId: roomId.trim() },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        error: `Room '${roomId}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room: updatedRoom
    });
  } catch (error) {
    console.error(`[roomController:updateRoom] Error: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  getOrCreateRoom,
  updateRoom
};
