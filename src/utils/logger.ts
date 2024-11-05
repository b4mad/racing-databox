import debug from 'debug';

// Add immediate console log to verify the file is loaded
// console.log('Logger initializing...');

// Create namespace for different parts of the application
export const logger = {
    paddock: debug('paddock:service'),
    api: debug('paddock:api'),
    telemetry: debug('paddock:telemetry')
};

// Enable logging in development
if (process.env.NODE_ENV === 'development') {
    console.log('Development mode detected, enabling debug logging');
    debug.enable('paddock:*');
    logger.paddock('Debug logging initialized');
} else {
    // console.log('Not in development mode, NODE_ENV:', process.env.NODE_ENV);
}
