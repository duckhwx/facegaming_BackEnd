const express = require('express');
const Register = require('../controller/Register');
const Login = require('../controller/Login');
const Publication = require('../controller/Publication');
const utils = require('../../utils/utils');
const Profile = require('../controller/Profile');
const Friends = require('../controller/Friends');

const router = express.Router();
// Identifica uma requisição do front (que ta em aspas simples), e vai lá pra const Register (que tem a rota do Controller)
router.use('/Register', Register);
router.use('/Login', Login);
router.use('/Publication', utils.validAuthorization, Publication);
router.use('/Profile', utils.validAuthorization, Profile);
router.use('/Friends', utils.validAuthorization, Friends);


module.exports = router;
