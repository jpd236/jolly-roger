import { check } from 'meteor/check';
import Logger from '../../Logger';
import Puzzles from '../../lib/models/Puzzles';
import addPuzzleTag from '../../methods/addPuzzleTag';
import getOrCreateTagByName from '../getOrCreateTagByName';
import defineMethod from './defineMethod';

defineMethod(addPuzzleTag, {
  validate(arg) {
    check(arg, {
      puzzleId: String,
      tagName: String,
    });

    return arg;
  },

  async run({ puzzleId, tagName }) {
    check(this.userId, String);

    // Look up which hunt the specified puzzle is from.
    const hunt = await Puzzles.findOneAsync({
      _id: puzzleId,
    }, {
      fields: {
        hunt: 1,
      },
    });
    const huntId = hunt?.hunt;
    if (!huntId) throw new Error(`No puzzle known with id ${puzzleId}`);
    const tagId = (await getOrCreateTagByName(huntId, tagName))._id;

    Logger.info('Tagging puzzle', { puzzle: puzzleId, tag: tagName });
    await Puzzles.updateAsync({
      _id: puzzleId,
    }, {
      $addToSet: {
        tags: tagId,
      },
    });
  },
});
