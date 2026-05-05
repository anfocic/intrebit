import {randomBytes} from "node:crypto";
import {argon2id} from "hash-wasm";

const CTRL_C = "\x03";
const DEL = "\x7f";
const BS = "\x08";

function readPassword(label) {
    return new Promise((resolve, reject) => {
        const stdin = process.stdin;
        const stdout = process.stdout;
        if (!stdin.isTTY) {
            reject(new Error("hash-password requires a TTY"));
            return;
        }
        stdout.write(`${label}: `);
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");
        let buf = "";
        const onData = (chunk) => {
            for (const ch of chunk) {
                if (ch === CTRL_C) {
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdout.write("\n");
                    process.exit(130);
                }
                if (ch === "\r" || ch === "\n") {
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdin.removeListener("data", onData);
                    stdout.write("\n");
                    resolve(buf);
                    return;
                }
                if (ch === DEL || ch === BS) {
                    if (buf.length > 0) buf = buf.slice(0, -1);
                    continue;
                }
                buf += ch;
            }
        };
        stdin.on("data", onData);
    });
}

async function main() {
    const pw1 = await readPassword("password");
    if (!pw1 || pw1.length < 12) {
        console.error("password must be at least 12 characters");
        process.exit(1);
    }
    const pw2 = await readPassword("confirm ");
    if (pw1 !== pw2) {
        console.error("passwords do not match");
        process.exit(1);
    }
    const salt = new Uint8Array(randomBytes(16));
    const hash = await argon2id({
        password: pw1,
        salt,
        parallelism: 1,
        iterations: 3,
        memorySize: 65536,
        hashLength: 32,
        outputType: "encoded",
    });
    process.stdout.write(`\n${hash}\n`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
