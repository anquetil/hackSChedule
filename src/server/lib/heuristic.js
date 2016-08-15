var _ = require('lodash');

module.exports = function (combination, bucket) {
  var pickArray = [];
  for (var courseId in combination) {
    pickArray = _.concat(pickArray, combination[courseId]);
  }
  var bucket = _.flatMapDepth(_.pick(bucket, pickArray), function (val) { return val }, 2);
  var result = score(bucket);
  return result;
};

module.exports.generateBuckets = function (courseData) {
  var bucket = {};

  for (var courseId in courseData) {
    for (var sectionId in courseData[courseId].sections) {
      var sectionData = courseData[courseId].sections[sectionId];
      for (var block of sectionData.blocks) {
        Object.assign(block, {
          start: convertToMin(block.start),
          end: convertToMin(block.end),
          full: (sectionData.number_registered >= sectionData.spaces_available),
          type: (sectionData.type),
        })
      }
      bucket[sectionId] = sectionData.blocks;
    }
  }

  return bucket;
}

function score(bucket) {
  return calcGaps(bucket) + calcOptimalStartTime(bucket);
}

function calcGaps(bucket) {
  var score = 0;

  var days = ['S', 'M', 'T', 'W', 'H', 'F', 'S'];

  for (var day of days) {
    var temp = _.filter(bucket, { day });
    if (temp.length > 1) {
      for (var i = 0; i < temp.length - 1; i++) {
        for (var j = i + 1; j < temp.length; j++) {
          if(temp[i].start > temp[j].end) {
            score += temp[i].start - temp[j].end;
          } else if(temp[j].start > temp[i].end) {
            score += temp[j].start - temp[i].end;
          }
        }
      }
    }
  }

  return score;
}

function calcOptimalStartTime(bucket) {
  var score = 0;

  var optimal = convertToMin('13:00');

  for (var obj of bucket) {
    if (obj.full) score += 10;
    if(obj.type !== 'Qz') {
      score += Math.abs(optimal - obj.start);
    }
  }

  return score;
}

function convertToMin(time) {
  // ex: convert '13:50' to '830'
  if (time === null) return null;
  var time = time.split(':');
  return Math.round(time[0]) * 60 + Math.round(time[1]);
}
