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
        res.redirect('profesor/profesor_index');
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_login', {});
    }
});

/* Verifica si esta logeado, redirecciona a index si es asi */
router.get('/profesor_index', function(req, res, next) {
    if(req.session.profesorLogged == true){
        idprofesor = req.session.profesorData["idprofesor"].toString();
        date = new Date()
        semestre = "1";
        // Si es pasado julio
        if(date.getMonth()+1 > 7){
            semestre = "2";
        }
        periodo = date.getFullYear().toString() + "-" + semestre;
        console.log(periodo);
        Request.get("http://52.14.108.19:8000/get_asignaturas_dictadas/" + idprofesor + "/" + periodo, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/profesor_index', { is_login: req.session.profesorLogged, data: data});
            }
        });
    } else{
        res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
    }
});

/* Obtiene las asignaturas de un profesor segun el periodo */
router.get('/get_asignaturas_dictadas/:periodo', function(req, res, next) {
    if(req.session.profesorLogged == true){
        var periodo = req.params.periodo;
        console.log(periodo);
        idprofesor = req.session.profesorData["idprofesor"].toString();
        Request.get("http://52.14.108.19:8000/get_asignaturas_dictadas/" + idprofesor + "/" + periodo, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/profesor_index', { is_login: req.session.profesorLogged, data: data});
            }
        });
    } else{
        res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
    }
});

/* Desloguea al usuario */
router.get('/profesor_logout', function(req, res, next) {
    if(req.session.profesorLogged == true){
        req.session.profesorLogged = false;
        req.session.profesorData["logged"] = false;
    } else{
        res.redirect('/');
    }
});

/* Verifica los datos */
router.post('/profesor_login_confirm', function(req, res, next) {
    if(req.session.profesorLogged == false){
        var input = JSON.parse(JSON.stringify(req.body));
        // Se hace la consulta a la api de estudiente
        try {
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "http://52.14.108.19:8000/login_prof/",
                "body": JSON.stringify({
                    "email": input.email,
                    "password": input.password
                })
            }, (error, response, body) => {
                if(error) {
                    return console.log(error);
                } else{
                    body = JSON.parse(body);
                    if(body["logged"]){
                        req.session.profesorLogged = true;
                        req.session.profesorData = body;
                        res.send({msj: "ok", data: req.session.profesorData});
                    } else{
                        res.send({msj: "error"});
                    }
                }
            });
        } catch(error) {
            console.error(error);
        }
    }
});

/* Registrar profesor (para registrar a un profesor, el email debe estar ingresado en la bd, 
    este registro es para confirmar email y almacenar contraseña) */
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
                "url": "http://52.14.108.19:8000/crear_usr_prof/",
                "body": JSON.stringify({
                    "email": input.email,
                    "password": input.password
                })
            }, (error, response, body) => {
                if(error) {
                    return console.dir(error);
                } else{
                    data = JSON.parse(JSON.stringify(body));
                    console.log(data);
                    res.send({msj: "ok", data: data});
                }
            });
        } catch (error) {
            console.error(error);
        }
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

module.exports = router;
