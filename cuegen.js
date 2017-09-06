const fs = require("fs");

const readFile = function (fileName) {
    return fs.readFileSync(fileName, "utf-8");
};

const makeTwoDigit = function(number) {
    if (number > 9) {
        return number;
    }
    return `0${ number }`;
};

const createTimeCode = function(hhmmss, millis) {
    let hours = 0;
    let minutes = 0;
    let seconds = parseInt(hhmmss.pop(), 10);
    if (hhmmss.length > 0) {
        minutes = parseInt(hhmmss.pop(), 10);
    }
    if (hhmmss.length > 0) {
        hours = parseInt(hhmmss.pop(), 10);
    }
    const frames = 75 * (millis * 0.001);
    return `${ makeTwoDigit((hours * 60) + minutes) }:${ makeTwoDigit(seconds) }:${ makeTwoDigit(frames) }`;
};

const createCue = function(input, fileName) {
    const lines = input.split("\n");
    const result = [];
    result.push(`FILE "${ fileName }.mp3" MP3`);
    lines.forEach((line, index) => {
        if (!line || line.length < 1 || line.indexOf(" ") === -1) {
            return;
        }
        result.push(`\tTRACK ${ makeTwoDigit(index + 1) } AUDIO`);
        const [time, ...rest] = line.split(" ");
        const [hhmmss, millis] = time.split(".");
        const timeParts = hhmmss.split(":");
        const title = rest.join(" ");
        result.push(`\t\tTITLE "${ title }"`);
        result.push(`\t\tINDEX 01 ${ createTimeCode(timeParts, parseInt(millis, 10)) }`)
    });
    return result.join("\n");
};

const writeCue = function (fileName, output) {
    fs.writeFileSync(fileName, output);
};

const run = function (inFile, outFile) {
    writeCue(outFile, createCue(readFile(inFile), inFile.split(".")[0]));
};

const main = function (args) {
    if (args.length < 3) {
        console.log("Required argument: input file");
        console.log("Optional argument: output file")
        return;
    }
    const inputFile = args[2];
    const outputFile = args[3] ? args[3] : `${ inputFile.split(".")[0] }.cue`;
    run(inputFile, outputFile);
}

main(process.argv);