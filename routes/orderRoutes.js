const router = require("express").Router();
const {
  createOrder,
  myOrders,
  allOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/my", protect, myOrders);
router.get("/", protect, adminOnly, allOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;