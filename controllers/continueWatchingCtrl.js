const ContinueWatching = require("../models/continueWatchingModel");
const Movies = require("../models/movieModel");
const Episodes = require("../models/episodeModel");

const ContinueWatchingCtrl = {
  getLastWatchedContents: async (req, res) => {
    try {
      const lastContent = await ContinueWatching.find({ userId: req.params.id })
        .sort({ timestamp: -1 })
        .populate({
          path: "movieId",
          select: "-video -category",
        })
        .populate({
          path: "episodeId",
          select: "-video",
        });
      if (!lastContent)
        return res
          .status(201)
          .json({ msg: "No last watched content for this user" });

      res.json({
        data: lastContent,
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createLastWatchedContents: async (req, res) => {
    try {
      const { userId, movieId, episodeId } = req.body;

      const newLastWatchedContent = new ContinueWatching({
        userId,
        movieId,
        episodeId,
        timestamp: new Date(),
      });

      await newLastWatchedContent.save();

      res.json({
        msg: "added to lastwatched model",
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = ContinueWatchingCtrl;
