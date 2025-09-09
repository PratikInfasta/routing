const express = require('express');

const router = express.Router();

router.get('/',(res,resp)=>{
    resp.send('about');
});

module.exports = router