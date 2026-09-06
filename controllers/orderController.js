const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Cart is empty" });

    const order = await Order.create({ user: req.user.id, items, total });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.allOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};