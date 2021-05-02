const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Item = require("../models/item");
const User = require("../models/user");

//all user related updates

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

router.post("/", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();

    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid Updates",
    });
  }

  try {
    updates.forEach((update) => {
      //dynamic update
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.send(req.user);
  } catch (err) {
    res.status(404).send(err);
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();

    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// all user cart operations

router.get("/cart", auth, async (req, res) => {
  try {
    await req.user
      .populate({
        path: "cart.item",
      })
      .execPopulate();
    res.send(req.user.cart);
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/cart/:item_id", auth, async (req, res) => {
  const item_id = req.params.item_id;
  console.log(item_id);

  try {
    const item = await Item.findOne({ _id: item_id });
    console.log(item);
    if (!item) {
      return res.status(404).send({
        error: "Invalid Item Id",
      });
    }

    const index = req.user.cart.findIndex((obj) => obj.item == item_id);
    console.log(index);

    //we want to use INC, DEC query type api for incrementing, decrementing.
    if (index !== -1) {
      return res.send({
        response: "Invalid call",
      });
    }

    //we allow same items to be pushed as user can buy multiple items
    req.user.cart.push({ item: item_id });

    await req.user.save();

    res.send({
      response: "Item added to cart!",
      item: item_id,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//delete all cart items
router.delete("/cart", auth, async (req, res) => {
  try {
    req.user.cart = [];
    await req.user.save();
    res.send({
      response: "Cart Empty",
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//remove all items with same item_id
router.delete("/cart/:item_id", auth, async (req, res) => {
  try {
    const item_id = req.params.item_id;

    req.user.cart = req.user.cart.filter((item) => {
      return item.item._id.toString() != item_id.toString();
    });

    req.user.save();

    res.send({
      response: "Item removed",
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//increment, decrement item count.
// /cart/:item_id?type=INC/DEC
router.patch("/cart/:item_id/:type", auth, async (req, res) => {
  let type = req.params.type;
  type = type.toUpperCase().trim();

  if (!["INC", "DEC"].includes(type)) {
    return res.status(404).send({
      response: `Invalid type ${type}`,
    });
  }

  try {
    const item_id = req.params.item_id;

    const item = await Item.findOne({ _id: item_id });

    if (!item) {
      res.send({
        response: "No such Item Id exists",
      });
    }

    const index = req.user.cart.findIndex((obj) => obj.item == item_id);

    if (index !== -1) {
      if (type === "INC") {
        req.user.cart[index].count++;
      } else {
        req.user.cart[index].count--;
        console.log(req.user.cart[index].count);
        if (req.user.cart[index].count <= 0) {
          req.user.cart = req.user.cart.filter((obj) => {
            return obj.item._id.toString() != item_id.toString();
          });
        }
      }
    } else {
      return res.status(404).send({
        response: "Item not found",
      });
    }

    await req.user.save();

    res.send({
      response: "ok",
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
