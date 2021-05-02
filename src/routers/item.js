const express = require("express");
const router = express.Router();
const Item = require("../models/item");
const auth = require("../middleware/auth");

//get details of a single cart item
//no auth in routes because not needed a seller modal
router.get("/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const item = await Item.findOne({ _id });

    if (!item) {
      return res.status(404).send();
    }
    res.send(item);
  } catch (err) {
    res.status(500).send(err);
  }
});

//add a new item to site
//later we can create a seller vs buyer type modals so we will pass seller id as well with req.body.
//so we can identify all items listed by seller.
router.post("/", async (req, res) => {
  const item = new Item({
    ...req.body,
  });

  try {
    await item.save();
    res.status(201).send(item);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch("/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "title"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({
      error: "Invalid update",
    });
  }

  console.log(req.params.id);

  try {
    const item = await Item.findOne({
      _id: req.params.id,
    });

    if (!item) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      item[update] = req.body[update];
    });

    await item.save();

    res.send(item);
  } catch (err) {
    res.status(404).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
    });
    if (!item) {
      return res.status(404).send();
    }
    res.send(item);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
