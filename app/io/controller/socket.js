'use strict';

// module.exports = app => {
//   class Controller extends app.Controller {
//     async index() {
//       const message = this.ctx.args[0];
//       console.log('chat :', message + ' : ' + process.pid);
//       this.ctx.socket.emit('res', 'say content');
//     }
//   }
//   return Controller;
// };

// or async functions
exports.index = async function() {
  console.log('server socket log');
  const message = this.args[0];
  await this.socket.emit('res', `Hi! I've got your message: ${message}`);
};
