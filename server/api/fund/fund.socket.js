/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var fund = require('./fund.model');

exports.register = function(socket) {
  fund.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  fund.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('fund:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('fund:remove', doc);
}
