const fs = require('fs');
const net = require('net');
const moment = require('moment-timezone');
const { parentPort, workerData } = require('worker_threads');

// Read from environment variables
const TARGET_HOST = process.env.TARGET_HOST;
const TARGET_PORT = process.env.TARGET_PORT;
const INTERVAL_SECONDS = process.env.INTERVAL_SECONDS;
const IMEI = process.env.IMEI;
const FilePath='./new.txt';
// Sleep utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// TCP send utility
function sendToPort(packet) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(TARGET_PORT, TARGET_HOST, () => {
            console.log(`Connected to ${TARGET_HOST}:${TARGET_PORT}`);
            console.log('Sending packet:', packet);
            client.write(packet, () => {
                client.end();
                resolve();
            });
        });

        client.on('error', (err) => {
            console.error('Error:', err.message);
            reject(err);
        });

        client.on('close', () => {
            console.log('Connection closed');
        });
    });
}

// Main loop
(async () => {
    

    try {
        const packetFile = fs.readFileSync(FilePath, 'utf8');
        const lines = packetFile.split('\n');

        while (true) {
            for (const line of lines) {
                if (line.trim() === '') {
                    console.log('Empty line found. Restarting from beginning...');
                    break;
                }

                const stringsList = line.split(',');

                if (stringsList.length < 52) {
                    console.warn('Invalid line (too few fields), skipping:', line);
                    continue;
                }

                const changedString = moment().utc().format('YYMMDDHHmmss');
                const HaltPacket = [
                    stringsList[1], IMEI, stringsList[3], stringsList[4], stringsList[5],
                    changedString, stringsList[7], stringsList[8], stringsList[9], stringsList[10],
                    stringsList[11], stringsList[12], stringsList[13], stringsList[14], stringsList[15],
                    stringsList[16], stringsList[17], stringsList[18], stringsList[19], stringsList[20],
                    stringsList[21], stringsList[22], stringsList[23], stringsList[24], stringsList[25],
                    stringsList[26], stringsList[27], stringsList[28], stringsList[29], stringsList[30],
                    stringsList[31], stringsList[32], stringsList[33], stringsList[34], stringsList[35],
                    stringsList[36], stringsList[37], stringsList[38], stringsList[39], stringsList[40],
                    stringsList[41], stringsList[42], stringsList[43], stringsList[44], stringsList[45],
                    stringsList[46], stringsList[47], stringsList[48], stringsList[49], stringsList[50],
                    stringsList[51]
                ].join(',');

                await sendToPort(HaltPacket + '\r\n');
                await sleep(INTERVAL_SECONDS);
            }
        }
    } catch (err) {
        console.error(err);
    }
})();
