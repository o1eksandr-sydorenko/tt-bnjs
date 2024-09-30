const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv-flow').config();

const indexRouter = require('./routes/index');

const app = express();
const LOG = require('./logger')(module);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

LOG.info('**** Classical Composers Service ****');



const corsOpts = {
	origin: [],
	optionsSuccessStatus: 200
};

app.use( cors( corsOpts ) );
app.use( '/', indexRouter);

// Error handler should be last
app.use(function errorHandler(err, req, res, next) {
	if ( !err.logged ) LOG.error(err);
	if ( res.headersSent ) return next(err);

	res.status( 500 ).json({ data: `${err.message} \n ${err.stack}`});
});


LOG.info('**** Initialized        ****');

module.exports = app;
