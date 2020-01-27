var express = require('express');
var router = express.Router();

/* GET index. */
router.get('/', function(req, res, next) {
	res.render('index', {});
});

/* GET quienes somos. */
router.get('/nosotros', function(req, res, next) {
	res.render('nosotros', {});
});

/* GET preguntas frecuentes. */
router.get('/preguntas_frecuentes', function(req, res, next) {
	res.render('preguntas_frecuentes', {});
});

module.exports = router;
