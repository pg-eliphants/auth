import net from 'node:net';

function printState(s: net.Socket) {
    console.log('>>>>>');
    console.log('state/closed', s.closed);
    console.log('state/timeout', s.timeout);
    console.log('state/writable', s.writable);
    console.log('state/readyState', s.readyState);
    console.log('state/errored', s.errored?.message);
    console.log('state/writableEnded', s.writableEnded);
    console.log('state/destroyed', s.destroyed);
    console.log('state/finished', s.writableFinished);
    console.log('state/highWaterMark', s.writableHighWaterMark);
    console.log('<<<<<<');
}

const server = net.createServer((s) => {
    s.setTimeout(1000);
    let id = setTimeout(() => {
        console.log('writing to socket "Hello World"');
        s.write('Hello World', (err) => {
            id = setTimeout(() => {
                s.end(() => {
                    console.log('/server-client socket calls end()');
                    printState(s);
                });
            }, 5000);
        });
    }, 5000);

    //s.setEncoding()
    // writable
    // readable
    s.on('close', (hadError) => {
        console.log('client/event/close/[hadError]', hadError);
        printState(s);
    });
    // readable
    /*s.on('data', (chunk) => {
        // no encoding was set with "setEncoding
        // so "chunk" will be a Buffer
        console.log(`client/event/data: ${chunk.byteLength}`);
    });*/
    // readable
    s.on('end', () => {
        console.log('client/event/end');
        printState(s);
    });
    // readable
    s.on('pause', (...args) => {
        console.log('client/event/pause', args);
        printState(s);
    });
    // readable
    s.on('readable', (...args) => {
        console.log(`client/event/readable ${args.join()}, ${s.read()}`);
        printState(s);
    });
    // readable
    s.on('resume', (...args) => {
        console.log('client/event/resume', args);
        printState(s);
    });
    // writable
    s.on('drain', () => {
        console.log('client/event/drain');
        printState(s);
    });
    // readable
    // writable
    s.on('error', (error) => {
        console.log('client/event/error', error.message);
        clearTimeout(id);
        printState(s);
    });
    // writable
    s.on('finish', (...args) => {
        console.log('client/event/finish', args);
        printState(s);
    });
    // writable
    s.on('pipe', (src) => {
        console.log('client/event/pipe:');
    });
    // writable
    s.on('unpipe', (src) => {
        console.log('client/event/unpipe');
        printState(s);
    });
    // writable
    /* only in client context initiating a connection
    s.on('connect', (stream) => {
        console.log('client/event/connect');
        printState(s);
    });
    */
    s.on('timeout', () => {
        console.log('client/event/timeout');
        printState(s);
    });
});

server.on('close', () => {
    console.log('server/event/close');
});

server.on('connection', (socket) => {
    console.log('server/event/connection');
});

server.on('error', (error) => {
    console.log('server/event/error', error);
});

server.on('drop', (data) => {
    console.log('server/event/drop:', data);
});

server.listen(8080, '0.0.0.0', 5, () => {
    console.log('listening on port:', server.address());
});

function toObeservable(socket) {
    console.log('server/event/connection');
}

// bytes transferred
// status "open"|"connecting"|readable|closing/finish closing/end  closing/closed
/*

*/
