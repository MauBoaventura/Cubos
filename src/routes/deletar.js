const express = require("express");
const router = express.Router();

router.delete('/', (req, res) =>{
    res.send("<h1>Deletar</h1>")
} )


module.exports = router;