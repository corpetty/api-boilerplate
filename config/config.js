import Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow(['development', 'production', 'test', 'provision'])
        .default('development'),
    PORT: Joi.number()
        .default(4000),
    API_VERSION: Joi.string()
        .default('1.0')
        .description('API Version'),
    JWT_SECRET: Joi.string().required()
        .description('JWT Secret required to sign'),
    UNIQUE_NAME_DB: Joi.string()
        .default('api')
        .description('sqlite database name'),
    UNIQUE_NAME_TEST_DB: Joi.string()
        .default('api-test')
        .description('sqlite database for tests'),
    UNIQUE_NAME_PASSWD: Joi.string().allow('')
        .default('password')
        .description('sqlite password'),
}).unknown()
    .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

// if test, use test database
const isTestEnvironment = envVars.NODE_ENV === 'test';

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    apiVersion: envVars.API_VERSION,
    jwtSecret: envVars.JWT_SECRET,
    sqlite: {
        db: isTestEnvironment ? envVars.UNIQUE_NAME_TEST_DB : envVars.UNIQUE_NAME_DB,
        passwd: envVars.UNIQUE_NAME_PASSWD,
        db_path: envVars.DB_PATH,
    },
};

export default config;
