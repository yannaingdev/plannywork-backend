import express from "express";
import {
  createKeyAccount,
  getKeyAccountById,
  listKeyAccounts,
} from "../controllers/keyAccount.controller.js";

const keyAccountRouter = express.Router();

keyAccountRouter.route("/").post(createKeyAccount).get(listKeyAccounts);
keyAccountRouter.route("/:id").get(getKeyAccountById);

export default keyAccountRouter;
