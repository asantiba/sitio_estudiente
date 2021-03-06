var express = require('express');
var router = express.Router();

/* GET index. */
router.get('/', function(req, res, next) {
	if(req.session.new_user == null && req.session.new_user != "true"){
		req.session.new_user = "true";
		res.render('index', {new_user: "true"});
	} else{
		res.render('index', {new_user: "false"});
	}
});

/* GET quienes somos. */
router.get('/nosotros', function(req, res, next) {
	res.render('nosotros', {});
});

/* GET app paciente. */
router.get('/app_paciente', function(req, res, next) {
	res.render('app_paciente', {});
});

/* GET app estudiante. */
router.get('/app_estudiante', function(req, res, next) {
	res.render('app_estudiante', {});
});

/* GET preguntas frecuentes. */
router.get('/preguntas_frecuentes', function(req, res, next) {
	res.render('preguntas_frecuentes', {});
});

module.exports = router;
