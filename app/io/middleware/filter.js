'use strict';

module.exports = () => {
  return async (ctx, next) => {
    console.log('filter');
    console.log(ctx.packet);
    const say = 'huankang';
    ctx.socket.emit('res', 'packet!' + say);
    await next();
    console.log('packet response!');
  };
};
