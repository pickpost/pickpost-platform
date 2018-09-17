'use strict';

// 记录创建时间和创建者
exports.createFill = function(data) {
  return Object.assign(data, {
    createdAt: new Date(),
  });
};

// 记录更新时间和更新者
exports.updateFill = function(data) {
  return Object.assign(data, {
    updatedAt: new Date(),
  });
};
