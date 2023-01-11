const Genre = require("../models/genreModel");

const genreCtrl = {
  createGenre: async (req, res) => {
    try {
      const { name, categories } = req.body;
      if (!name && !catgories)
        return res
          .status(400)
          .json({ msg: "please include genre name and categories" });

      const newGenre = new Genre({
        name,
        categories,
      });

      await newGenre.save();
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  getGenres: async (req, res) => {
    try {
      const genres = await Genre.find().populate("categories");

      res.json(genres);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  getGenre: async (req, res) => {
    try {
      const genre = await Genre.findById({ _id: req.params.id }).populate(
        "categories"
      );

      res.json(genre);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  deleteGenre: async (req, res) => {
    try {
      const genre = await Genre.findByIdAndDelete({
        _id: req.params.id,
      }).populate("categories");

      res.json(genre);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = genreCtrl;
