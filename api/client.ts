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

const s = net.createConnection({ host: '0.0.0.0', port: 8080 });

s.setEncoding('utf8');
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
    console.log('client/event/data', chunk.length, chunk);
    printState(s);
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
    console.log('client/event/readable', args);
    // take some time to consume the data;
    setTimeout(() => {
        console.log('client/event/readable/ after some read buffer', s.read());
    }, 14000);
    printState(s);
});
// readable
//s.on('resume', (...args) => {
//    console.log('client/event/resume', args);
//});
// writable
s.on('drain', () => {
    console.log('client/event/drain');
    printState(s);
});
// readable
// writable
s.on('error', (error) => {
    console.log('client/event/error', error);
    printState(s);
});
// writable
s.on('finish', () => {
    console.log('client/event/finish:');
    printState(s);
});
// writable
s.on('pipe', (src) => {
    console.log('client/event/pipe:');
    printState(s);
});
// writable
s.on('unpipe', (src) => {
    console.log('client/event/unpipe');
    printState(s);
});
// writable

s.on('connect', (stream) => {
    console.log('client/event/connect');
    s.write('Thank you');
    printState(s);
});
s.on('timeout', () => {
    console.log('client/event/timeout');
    printState(s);
});

/*
scenario 1:
client connects
// log on server
-> server/event/connection
-> client/event/resume [
// log on client
-> client/event/resume []
-> client/event/connect
ctrl+c on client process
// log on server
->client/event/error Error: read ECONNRESET
->client/event/close/[hadError] true


scenario 2:
clients connects
(same as above)
ctrl+c on the server
(on client)
->client/event/error Error: read ECONNRESET
->client/event/close/[hadError] true

scenario 3:
(server is not up, client tries to connect).
-> client/event/resume [] // strange we do get a resume
client/event/error Error: connect ECONNREFUSED 0.0.0.0:8080
client/event/close/[hadError] true


scenario 4:
clients connets to server

server intiates ending of the client-server the connection with an end()
// server logs
server/event/connection
client/event/resume []
server ends the connection
client/event/finish []
client/event/readable []
client/event/end
client/event/close/[hadError] false

// client logs
client/event/resume []
client/event/connect
client/event/readable []
client/event/end
client/event/finish:
client/event/close/[hadError] false

NOTES:
With socket.end() the socket state becomes "readOnly" 
- state/closed false
- state/timeout undefined
- state/writable false
- state/readyState readOnly
- state/errored undefined
- state/writableEnded true
- state/destroyed false
- state/finished true

fires event Finish

>>>>>
- state/closed false
- state/timeout undefined
- state/writable false
- state/readyState readOnly
- state/errored undefined
- state/writableEnded true
- state/destroyed false
- state/finished true
<<<<<<

fires event "readable" with null data on readable.read()

state/closed false
state/timeout undefined
state/writable false
state/readyState readOnly
state/errored undefined
state/writableEnded true
state/destroyed false
state/finished true

fires event "end" 

state/closed false
state/timeout undefined
state/writable false
state/readyState closed
state/errored undefined
state/writableEnded true
state/destroyed false
state/finished true

fires event "close"
state/closed true
state/timeout undefined
state/writable false
state/readyState closed
state/errored undefined
state/writableEnded true
state/destroyed true
state/finished true

*/

/*

- stateObserver
- reconnector (creates new socket on the client); uses a strategy
- consumer (async using a queue we can turn a "pushed to consumer" to pull (consumer))
- producer

*/
