var express = require('express');
var fs = require('fs');
var router = express.Router();
var Request = require("request");

/* Inicializa variables session y renderiza vista login o index si esta logueado */
router.get('/', function(req, res, next) {
    // req.session.profesorLogged = false;
    if(req.session.profesorLogged == null){
        req.session.profesorLogged = false;
        req.session.profesorData = {};
    }
    if(req.session.profesorLogged == true){
        // Si esta logeado va al mainframe con todas las funcionalidades
        res.render('profesor/profesor_index', {data: req.session.profesorData});
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_login', {});
    }
});

/* Verifica si esta logeado para mostrar info de profesor en nav */
router.post('/is_login', function(req, res, next) {
    if(req.session.profesorLogged == true){
        res.render('profesor/is_login', { is_login: req.session.profesorLogged, data: req.session.profesorData});
    } else{
        res.render('profesor/is_login', { is_login: req.session.profesorLogged, data: false });
    }
});

/* Renderiza verifica los datos */
router.get('/profesor_login_confirm', function(req, res, next) {
    if(req.session.profesorLogged == false){
        // Se hace la consulta a la api de estudiente
        try {
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "http://52.14.108.19:8000/profesor_login/",
                "body": JSON.stringify({
                    "correo": "",
                    "password": ""
                })
            }, (error, response, body) => {
                if(error) {
                    return console.dir(error);
                }
                console.dir(JSON.parse(body));
            });
        } catch(error) {
            console.error(error);
        }
    }
});

/* Registrar profesor (para registrar a un profesor, el correo debe estar ingresado en la bd, 
    este registro es para confirmar correo y almacenar contraseña) */
router.get('/profesor_registrar', function(req, res, next) {
    if(req.session.profesorLogged != null && req.session.profesorLogged == true){
        // Si esta logeado va al mainframe con todas las funcionalidades
        res.render('profesor/profesor_index', {data: req.session.profesorData});
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_registrar', {});
    }
});

/* Renderiza verifica los datos */
router.post('/profesor_registrar_confirm', function(req, res, next) {
    if(req.session.profesorLogged == false){
        var input = JSON.parse(JSON.stringify(req.body));
        // Se hace la consulta a la api de estudiente
        try {
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "http://52.14.108.19:8000/login_prof/",
                "body": JSON.stringify({
                    "correo": input.correo,
                    "password": input.password
                })
            }, (error, response, body) => {
                if(error) {
                    return console.dir(error);
                } else{
                    data = JSON.parse(body);
                    console.log(data);
                    res.send({msj: "ok", data: data});
                }
            });
            // Request.get("http://52.14.108.19:8000/profesor_registrar", (error, response, body) => {
            //     if(error) {
            //         return console.dir(error);
            //     } else{
            //         data = JSON.parse(body);
            //         console.log(data);
            //         res.send({msj: "ok", data: data});
            //     }
            // });
        } catch (error) {
            console.error(error);
        }
    }
});

module.exports = router;
