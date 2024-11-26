import { check, Match } from "meteor/check";
import bodyParser from "body-parser";
import express from "express";
import type { GdriveMimeTypesType } from "../../../lib/GdriveMimeTypes";
import GdriveMimeTypes from "../../../lib/GdriveMimeTypes";
import addPuzzle from "../../addPuzzle";
import expressAsyncWrapper from "../../expressAsyncWrapper";

const createPuzzle = express.Router();

createPuzzle.use(bodyParser.json());

createPuzzle.post(
  "/:huntId",
  expressAsyncWrapper(async (req, res) => {
    check(req.params.huntId, String);
    check(res.locals.userId, String);
    check(req.body, {
      title: String,
      url: Match.Optional(String),
      tags: [String],
      expectedAnswerCount: Number,
      docType: Match.OneOf(
        ...(Object.keys(GdriveMimeTypes) as GdriveMimeTypesType[]),
      ),
      allowDuplicateUrls: Match.Optional(Boolean),
    });

    const id = await addPuzzle({
      userId: res.locals.userId,
      huntId: req.params.huntId,
      ...req.body,
    });
    res.json({
      id,
    });
  }),
);

export default createPuzzle;
