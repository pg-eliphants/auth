import type { FastifyServerOptions } from 'fastify';

// so "oneOf" in JSONSchema works
const fastifyOverrides: FastifyServerOptions = {
    ajv: {
        customOptions: {
            coerceTypes: false,
            useDefaults: false,
            removeAdditional: false,
            allErrors: true
        }
    }
};

export default fastifyOverrides;
