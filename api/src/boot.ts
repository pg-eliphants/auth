import type { FastifyInstance, FastifyServerOptions } from 'fastify';

import setupServer from './setupServer';

const FALLBACK_PORT = 4000;
const PORT = Number.parseInt(process.env.CALCULATOR_API_PORT as string, 10);

import permanentOverrides from './permanent-overrides';

const options: FastifyServerOptions = {
    logger: {
        level: 'debug'
    },
    ...permanentOverrides
};

queueMicrotask(function init() {
    setupServer(options, (root: FastifyInstance) => {
        const allRoutes = root.printRoutes({ commonPrefix: false });
        root.log.debug(allRoutes);
        root.listen(
            {
                port: isFinite(PORT) ? PORT : FALLBACK_PORT,
                host: '0.0.0.0',
                exclusive: false,
                readableAll: false,
                writableAll: false,
                ipv6Only: false
            },
            (err, address) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                root.log.info(`Listening on port: ${address}`);
            }
        );
    });
});

process.on('unhandledRejection', (reason, promise) => {
    const date = new Date().toISOString();
    console.error(`[${date}]: Unhandled Rejection at:`, promise, `reason: ${String(reason)}`);
    // above is always a sync write to files and pipes, but not to tty
    process.exit(1);
});

process.on('uncaughtException', (err, origin) => {
    const date = new Date().toISOString();
    console.error(
        `\n[${date}] UncaughtExcpetion error(1): ${String(
            err.stack
        )}\n[${date}]: UncaughtExcpetion error(1) at: ${origin}\n`
    );
    // above is always a sync write to files and pipes, but not to tty
    process.exit(1);
});
