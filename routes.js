const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Import your MongoDB models (assuming you have RoomType and Room models)
const RoomType = require('./models/RoomType');
const Room = require('./models/Room');

// POST endpoint for storing room types
router.post('/api/v1/room-types', async (req, res) => {
  try {
    const { name } = req.body;
    const roomType = new RoomType({ name });
    await roomType.save();
    res.status(201).json(roomType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET endpoint for fetching all room types
router.get('/api/v1/room-types', async (req, res) => {
  try {
    const roomTypes = await RoomType.find();
    res.json(roomTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST endpoint for storing rooms
router.post('/api/v1/rooms', async (req, res) => {
  try {
    const { name, roomType, price } = req.body;
    const room = new Room({ name, roomType, price });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET endpoint for fetching all rooms with optional filters
router.get('/api/v1/rooms', async (req, res) => {
  try {
    const { search, roomType, minPrice, maxPrice } = req.query;
    let filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (roomType) {
      filter.roomType = ObjectId(roomType);
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (maxPrice !== undefined) {
      filter.price = { $lte: Number(maxPrice) };
    }
    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH endpoint for editing a room
router.patch('/api/v1/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, roomType, price } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(roomId, { name, roomType, price }, { new: true });
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE endpoint for deleting a room
router.delete('/api/v1/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    await Room.findByIdAndDelete(roomId);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET endpoint for fetching a room by its id
router.get('/api/v1/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
