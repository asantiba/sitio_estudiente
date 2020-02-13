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
        periodo = get_periodo_actual();
        res.redirect('profesor/profesor_index/'+periodo);
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_login', {});
    }
});

/* Verifica si esta logeado, redirecciona a index si es asi */
router.get('/profesor_index/:periodo', function(req, res, next) {
    if(req.session.profesorLogged == true){
        idprofesor = req.session.profesorData["idprofesor"].toString();
        periodo = req.params.periodo.toString();
        console.log(periodo);
        Request.get("http://52.14.108.19:8000/get_asignaturas_dictadas/" + idprofesor + "/" + periodo, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/profesor_index', { is_login: req.session.profesorLogged, data: data, periodo: periodo});
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
        
    }
    res.redirect('/');
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
                    "first_name" : input.first_name,
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

/* Entrega las asignaturas que no estoy inscrito segun el periodo */
router.get('/inscribir_asignatura/:periodo', function(req, res, next) {
    if(req.session.profesorLogged != null && req.session.profesorLogged == true){
        periodo = req.params.periodo.toString();
        idprofesor = req.session.profesorData["idprofesor"].toString();
        // Consulta a la api los estudiantes de esa asignatura en ese periodos
        Request.get("http://52.14.108.19:8000/get_asignaturas/" + idprofesor + "/" + periodo, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/inscribir_asignatura', { is_login: req.session.profesorLogged, data: data, periodo: periodo});
            }
        });
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_registrar', {});
    }
});

/* Ingresa una asignatura a las asignaturas de un profesor */
router.post('/inscribir_asignatura', function(req, res, next) {
    if(req.session.profesorLogged == true){
        var input = JSON.parse(JSON.stringify(req.body));
        idprofesor = req.session.profesorData["idprofesor"].toString();
        // Se hace la consulta a la api de estudiente
        try {
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "http://52.14.108.19:8000/inscribir_asignatura/",
                "body": JSON.stringify({
                    "idprofesor": idprofesor,
                    "idasignatura": parseInt(input.idasignatura),
                    "periodo": input.periodo
                })
            }, (error, response, body) => {
                if(error) {
                    return console.log(error);
                } else{
                    body = JSON.parse(body);
                    if(body["msj"] == "Se ha inscrito su asignatura."){
                        res.send({msj: "ok"});
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

/* Ingresa una asignatura a las asignaturas de un profesor */
router.post('/desinscribir_asignatura', function(req, res, next) {
    if(req.session.profesorLogged == true){
        var input = JSON.parse(JSON.stringify(req.body));
        idprofesor = req.session.profesorData["idprofesor"].toString();
        // Se hace la consulta a la api de estudiente
        try {
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "http://52.14.108.19:8000/desinscribir_asignatura/",
                "body": JSON.stringify({
                    "idprofesor": idprofesor,
                    "idasignatura": parseInt(input.idasignatura),
                    "periodo": input.periodo
                })
            }, (error, response, body) => {
                if(error) {
                    return console.log(error);
                } else{
                    body = JSON.parse(body);
                    if(body["msj"] == "Se ha desinscrito su asignatura."){
                        res.send({msj: "ok"});
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

/* Entrega los estudiantes que hay en una asignatura */
router.get('/estudiantes_asignatura/:idasignatura_asignada', function(req, res, next) {
    if(req.session.profesorLogged != null && req.session.profesorLogged == true){
        idasignatura_asignada = req.params.idasignatura_asignada.toString();
        // Consulta a la api los estudiantes de esa asignatura en ese periodos
        Request.get("http://52.14.108.19:8000/get_estudiantes_asignatura/" + idasignatura_asignada, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/estudiantes_asignatura', { is_login: req.session.profesorLogged, data: data});
            }
        });
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_registrar', {});
    }
});

/* Entrega los estudiantes que hay en una asignatura */
router.get('/tratamientos_estudiante/:idestudiante', function(req, res, next) {
    if(req.session.profesorLogged != null && req.session.profesorLogged == true){
        idestudiante = req.params.idestudiante.toString();
        // Consulta a la api los estudiantes de esa asignatura en ese periodos
        Request.get("http://52.14.108.19:8000/get_tratamientos_estudiante/" + idestudiante, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/tratamientos_estudiante', { is_login: req.session.profesorLogged, data: data});
            }
        });
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
    }
});

/* Entrega los estudiantes que hay en una asignatura */
router.get('/tratamiento_estudiante/:idasignatura_asignada', function(req, res, next) {
    if(req.session.profesorLogged != null && req.session.profesorLogged == true){
        idasignatura_asignada = req.params.idasignatura_asignada.toString();
        // Consulta a la api los estudiantes de esa asignatura en ese periodos
        Request.get("http://52.14.108.19:8000/get_tratamiento_estudiante/" + idasignatura_asignada, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/tratamiento_estudiante', { is_login: req.session.profesorLogged, data: data});
            }
        });
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
    }
});

/* Ingresa una evaluacion de tratamiento a un estudiante */
router.post('/evaluacion_tratamiento', function(req, res, next) {
    if(req.session.profesorLogged == true){
        var input = JSON.parse(JSON.stringify(req.body));
        // Se hace la consulta a la api de estudiente
        try {
            Request.post({
                "headers": { "content-type": "application/json" },
                "url": "http://52.14.108.19:8000/evaluacion_tratamiento/",
                "body": JSON.stringify({
                    "idtratamiento_asignado": parseInt(input.idtratamiento_asignado),
                    "votacion": parseInt(input.votacion),
                    "comentario": input.comentario,
                    "votante": "profesor",
                    "publico": 1,
                    "cuestionario": {}
                })
            }, (error, response, body) => {
                if(error) {
                    return console.log(error);
                } else{
                    body = JSON.parse(body);
                    if(body["msj"] == "Tratamiento evaluado correctamente."){
                        console.log("entra");
                        res.send({msj: "ok", idtratamiento_asignado:parseInt(input.idtratamiento_asignado) });
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

/* Entrega los estudiantes que hay en una asignatura */
router.get('/perfil_estudiante/:idestudiante', function(req, res, next) {
    if(req.session.profesorLogged != null && req.session.profesorLogged == true){
        idestudiante = req.params.idestudiante.toString();
        // Consulta a la api los estudiantes de esa asignatura en ese periodos
        Request.get("http://52.14.108.19:8000/get_estudiante/" + idestudiante, (error, response, body) => {
            if(error) {
                return console.log(error);
                res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
            } else{
                data = JSON.parse(body);
                console.log(data);
                res.render('profesor/perfil_estudiante', { is_login: req.session.profesorLogged, data: data});
            }
        });
    } else {
        // Si no, lo redirige a una vista donde solo puede ver el recurso sin detalles
        res.render('profesor/profesor_login', { is_login: req.session.profesorLogged, data: false });
    }
});

function get_periodo_actual(){
    date = new Date()
    semestre = "1";
    // Si es pasado julio
    if(date.getMonth()+1 > 7){
        semestre = "2";
    }
    periodo = date.getFullYear().toString() + "-" + semestre;
    return periodo;
}

module.exports = router;
