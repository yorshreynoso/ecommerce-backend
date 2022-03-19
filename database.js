const mongoose = require("mongoose");
require('dotenv').config();


mongoose.connect(process.env.URI, {
    useNewUrlParser: true
} );

//validamos cuando se haya conectado correctamente, puede usarse once o on, la diferencia es que once solo corre una vez y on sigue escuchando
mongoose.connection.once('open', () => {
    console.log('Database is connected to', process.env.URI);
});