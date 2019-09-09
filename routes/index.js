const express = require('express');
const router = express.Router();

module.exports = function() {
    router.get('/', (req, res) => {
        res.render('home')
    });
    router.get('/crear-cuenta', (req, res) => {
        res.render('crearcuenta');
    });

    return router;
}