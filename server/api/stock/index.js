'use strict';

var express = require('express');
var controller = require('./stock.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/',  auth.isAuthenticated(),controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/symbol/:symbol', auth.isAuthenticated(), controller.getCompany);
router.post('/',  auth.isAuthenticated(),controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
//router.put('/:id/action/:action/amount/:amount', auth.isAuthenticated(), controller.trade);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.put('/delete/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
