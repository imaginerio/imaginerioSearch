const { omit } = require('lodash');
const { Animation, AnimationFrame } = require('../models');
const config = require('../config/animation');

const animations = config[process.env.MAPPING];

module.exports = {
  up() {
    if (animations) {
      return Promise.all(
        Object.keys(animations).map(name =>
          Animation.create({
            name,
            ...omit(animations[name], 'frames'),
          }).then(animation => {
            const { frames } = animations[name];
            return Promise.all(
              frames.map((frame, ordering) =>
                AnimationFrame.create({
                  AnimationId: animation.id,
                  ordering,
                  ...frame,
                })
              )
            );
          })
        )
      );
    }
    return Promise.resolve();
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('AnimationFrames');
    await queryInterface.bulkDelete('Animations');
  },
};

if (require.main === module) module.exports.up();
