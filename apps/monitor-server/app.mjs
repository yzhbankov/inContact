import '@rtls-platform/env/index.js'; // should be first import to read all env variables before config init
import { createRepository } from '@rtls-platform/repository';
import { createLogger, LoggerTypes } from '@rtls-platform/logger';
import { runDBMigrations } from '@rtls-platform/db-migration';
import * as App from './lib/api/index.mjs';
import * as DataScanner from './lib/api/app.mjs';
import * as ConfigContainer from './lib/config.cjs';
import { createPgDbConnection } from './lib/db/index.mjs';
import ModelBase from './lib/models/ModelBase.mjs';

// Init Logger
const logger = createLogger({
    type: LoggerTypes.Winston,
    context: {
        logLevel: ConfigContainer.config.logLevel,
        serviceName: ConfigContainer.config.serviceName,
    },
});

App.setLogger(logger);

// Run DB Migrations
await runDBMigrations();

// Init Repository Layer
const repository = createRepository({
    db: createPgDbConnection({
        port: ConfigContainer.config.db.port,
        host: ConfigContainer.config.db.host,
        user: ConfigContainer.config.db.user,
        database: ConfigContainer.config.db.database,
        password: ConfigContainer.config.db.password,
        connectionsLimit: ConfigContainer.config.db.connectionsLimit,
    }),
});

// Init Domain Model Layer
ModelBase.setRepository(repository);

// Init Controllers Layer (API)
DataScanner.start(ConfigContainer.config.service);

// Add Global Unhandled Errors Handlers
async function exit() {
    await DataScanner.stop();
    logger.info('Exit');

    process.exit(0);
}

process.on('SIGTERM', async () => {
    logger.error('SIGTERM signal caught');
    await exit();
});

process.on('SIGINT', async () => {
    logger.error('SIGINT signal caught');
    await exit();
});

process.on('unhandledRejection', (error) => {
    logger.error('unhandledRejection', error.stack);
});

process.on('uncaughtException', (error) => {
    logger.error('uncaughtException', error.stack);
});

// todo: add swagger documentation
// todo: implement basic routes: GET /users - returns list of syste users with detailed information
// todo: implement basic routes: GET /contacts - returns list of tracked contacts with detailed information
// todo: implement basic routes: GET /sessions - returns list of active/inactive sessions with detailed information
// todo: implement basic routes: GET /system_info - returns information about running services, CPU, Memory, Disk usage
