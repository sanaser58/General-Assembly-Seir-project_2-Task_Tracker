const express = require('express');


const app = express();

const PORT = process.env.PORT || 3000;


app.get('/',(req, res) => {
    res.send('hey! just cheaking you working or not')
})

app.listen(PORT, () => {
    console.log(`Listening on port  ${PORT}`)
})