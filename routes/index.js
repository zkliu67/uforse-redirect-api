const express = require('express');
const jumpController = require('../controllers/index');

const router = express.Router();

router.get('/:companyId', jumpController.jumpTo);

module.exports = router