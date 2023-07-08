import type { FastifyInstance, FastifyError } from 'fastify';
import StatusCodes from 'http-status-codes';
import { fastifyRawBody } from 'fastify-raw-body';


// TODO import { calculatorRequest, calculatorResponse, errorResponse } from './shared/schema';

declare module 'fastify' {
    export interface FastifyInstance {
        isProduction: boolean;
    }
}

export default async function setup(parent: FastifyInstance): Promise<FastifyInstance> {
    await parent.register(async function (instance: FastifyInstance) {
        await instance.register(fastifyRawBody, {
            field: 'rawBody',
            global: false,
            encoding: 'utf8',
            runFirst: true
        });

        // instance.addSchema(calculatorRequest);
        // instance.addSchema(calculatorResponse);
        // instance.addSchema(errorResponse);
        // instance.route(calculatorRoute);
        instance.decorate('isProduction', process.env.NODE_ENV === 'production');

        instance.setErrorHandler(function (
            this: FastifyInstance,
            error: FastifyError & {
                validationContext?: string;
                serialization?: { url: string; method: string };
            },
            req,
            reply
        ) {
            this.log.trace('rawHeaders: [%o], body:[%o]', req.raw.rawHeaders, req.rawBody);
            const reqId = String(req.id);
            if (Array.isArray(error.validation) && error.validationContext === 'body') {
                reply.status(StatusCodes.BAD_REQUEST).send({
                    error: {
                        code: 400,
                        message: 'Invalid Request sent',
                        reqId
                    }
                });
                this.log.error('Invalid Request sent: [%o]', error);
                return;
            }

            // 500 error section
            const details = !this.isProduction ? error.stack ?? error.message : error.message;
            const message = `internal server error: ${details}`;

            reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: {
                    code: StatusCodes.INTERNAL_SERVER_ERROR,
                    message,
                    reqId
                }
            });

            this.log.error(
                'err: [%s], from: [%s], url:[%s]',
                StatusCodes.INTERNAL_SERVER_ERROR,
                req.socket.remoteAddress,
                req.url
            );
            this.log.error('err: [%s], stacktrace: [%s]', error.message, error.stack);
        });
    });
    return parent;
}
