const Payments = require("../models/paymentModel");
const Users = require("../models/userModel");
const Movies = require("../models/movieModel")
const Seasons = require("../models/seasonModel")

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.query

    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    //    gte = greater than or equal
    //    lte = lesser than or equal
    //    lt = lesser than
    //    gt = greater than
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const paymentCtrl = {
  getOrders: async (req, res) => {
    try {
      const features = new APIfeatures(Payments.find(), req.query)
        .filtering()
        .sorting()
        .paginating();

      const orders = await features.query;

      res.json({
        status: "success",
        result: orders.length,
        orders: orders,
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createOrderFromWallet: async (req, res) => {
    try {
      const { user_id, item_id, paymentType, price } = req.body;
      if (!user_id && !item_id && payment_id && !paymentType && !price)
        res.status(404).json({ msg: "Payment was not succssfully." });

      const user = await Users.findOne({ user_id });
      if (!user)
        res.status(404).json({ msg: "Please login to verify yourself" });

      if (user.wallet < price) return res.status(404).json({ msg: "Insufficient Wallet ballance" });

      const deductBalance = user.wallet - price;

      await Users.findOneAndUpdate({ user_id }, { wallet: deductBalance });
      const newOrder = new Payments({
        user_id,
        item_id,
        paymentType,
        price,
      });

      await newOrder.save();

      res.json({
        msg: "Order created successfully ",
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createOrderFromCard: async (req, res) => {
    try {
      const { user_id, item_id, payment_id, paymentType, price } = req.body;
       if (!user_id && !item_id && !payment_id && !paymentType && !price)
        res.status(404).json({ msg: "Payment was not succssfully." });
        
      const newOrder = new Payments({
        user_id,
        item_id,
        payment_id,
        paymentType,
        price
      })
      
      await newOrder.save()
      
      res.json({ msg: "card payment successfully." })
    } catch (err) {
      res.status(500).json({ msg: err.message})
    }
  },
  verifyItemPurchase: async (req, res) => {
    try {
      const { user_id, item_id } = req.body;
      if (!user_id || !item_id)
        return res.status(404).json({ msg: "wrong credentials" });

      const verify = await Payments.findOne({ user_id, item_id });
      if (!verify)
        return res
          .status(404)
          .json({ msg: "No payment has been made for this item" });

      res.json({ 
        msg: "Item verified with user purschase",
        verify: verify.item_id
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  topUpWallet: async (req, res) => {
    try {
      const { user_id, payment_id, paymentType, price } = req.body;
      if (!user_id || !payment_id || !price)
        return res.status(404).json({ msg: "payload not properly passed" });

      const user = await Users.findOne({ user_id });
      if (!user) return res.status(404).json({ msg: 'invalid user'})
      
      const addToWallet = user.wallet + price
      
      const topUp = await Users.findOneAndUpdate({ user_id }, {wallet: addToWallet})

      const newTopup = new Payments({
        user_id,
        payment_id,
        paymentType,
        price,
      });

      await newTopup.save();

      res.json({ 
        msg: "Your wallet has been funded",
        user
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  getUserOrders: async (req, res) => {
    try {
      const { user_id, item_id } = req.body;
      const orders = await Payments.find({ user_id, item_id }).populate('item_id')
      const movies = await Movies.find({item_id}).select('-video')
      const seasons = await Seasons.find({item_id}).select('-episodes')
      
      const combined = movies.concat(seasons)
      
      
      res.json({ 
        userOrders: combined,
       })
    } catch (err) {
      res.status(500).json({ msg: err.message })
    }
  }
};

module.exports = paymentCtrl;
