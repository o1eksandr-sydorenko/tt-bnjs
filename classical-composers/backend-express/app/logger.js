const { createLogger, transports } = require('winston');
const winstonTimestampColorize = require('winston-timestamp-colorize');
const { format } = require('logform');

const path = require('path');
const util = require('util');

const getModuleName = function(callingModule) {
	const parts = callingModule.filename.split(path.sep);
	return path.join(parts[parts.length - 2], parts.pop());
};

const TYPE_TO_FORMAT = {
	'string': '%s',
	'object': '%O',
	'number': '%d'
};

const logDirectory = process.env.MSG_SVC_LOG_DIR;
console.log(`Initializing logging at ${logDirectory}`);

const colorizeError = (errorStackOrMessageText) => format.colorize({ all: true }).colorize( 'error', errorStackOrMessageText );;

const createLogFormat = function(callingModule, colorize) {
	const fileName = getModuleName(callingModule);

	let formatOptions = [
		format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
	];

	if ( colorize ) {
		formatOptions.push( format.colorize() );
		formatOptions.push( winstonTimestampColorize({ color: 'blue' }) );
	}

	const printFormat = format.printf(info => {
		let meta = info[Symbol.for('splat')] || [];
		let messageFormat = typeof info.message === 'object' ? '%O ' : '%s ';
		let metaFormat = '';

		meta.forEach( item  => {
			metaFormat += TYPE_TO_FORMAT[ typeof item ];
		});

		let messageText = info.message;
		if ( info.stack && colorize ) {
			if ( meta.length > 0 ) {
				info.stack = meta[ 0 ].stack;
				meta = [];
			}
			messageText = `${info.message} \n ${info.stack}`;
			messageText = colorizeError( messageText );
		}

		// Formatting messages like console.log does
		const message = util.formatWithOptions({ colors: colorize }, messageFormat + metaFormat, messageText, ...meta);

		return `${info.timestamp} ${info.level} ${fileName}: ${message}`;
	});

	formatOptions.push( printFormat );

	return format.combine( ...formatOptions );
};


const errorPreFormatter = format( info => {
	if ( info.stack ) {
		return Object.assign({}, info, {
			stack: info.stack,
			message: info.message
		});
	}

	return info;
});

module.exports = function(callingModule) {
	return createLogger({
		// 'info', 'debug', 'error', etc...
		level: process.env.MSG_SVC_LOG_LEVEL || 'info',
		format: errorPreFormatter(),
		transports: [
			new transports.Console({
				format: createLogFormat( callingModule, true )
			}),
			new transports.File({
				filename: logDirectory + '/app-log.log',
				format: createLogFormat( callingModule, false )
			})
		],
		exceptionHandlers: [
			new transports.Console({
				format: createLogFormat( callingModule, true )
			}),
			new transports.File({
				filename: logDirectory + '/exceptions.log',
				format: createLogFormat( callingModule, false )
			})
		],
		exitOnError: false
	});
};
