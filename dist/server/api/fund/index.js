'use strict';

var express = require('express');
var controller = require('./fund.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.getFund);
router.get('/complete/:id', auth.isAuthenticated(), controller.show);

router.post('/',  auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.finalize);
router.put('/finalize/:id', auth.isAuthenticated(),  controller.finalize);
router.put('/:id/action/:action', auth.isAuthenticated(),  controller.update);
router.delete('/:id',  auth.isAuthenticated(), controller.destroy);

module.exports = router;
