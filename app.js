#!/usr/bin/env node
const chalk = require('chalk');
const request = require('request-promise');
const ProgressBar = require('progress');
const https = require('https');
const fs = require('fs');

if (process.argv.length < 3) {
    console.log(`Usage: radiojavan-dl <song-url> [<directory>]\n\rExample: ${chalk.blue('radiojavan-dl https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani')}`);
    process.exit(1);
}

async function getDownloadLink(fileName) {
    try {
        const options = {
            "method": "GET",
            "uri": "https://www.radiojavan.com/mp3s/mp3_host/?id=" + fileName,
            "json": true
        }

        const result = await request(options);
        const songURL = `${result.host}/media/mp3/${fileName}.mp3`;

        return songURL;

    } catch(err) {
        console.log(err);
    }
}

(async() => {
    
    const fileName = process.argv[2].split('/')[5];
    const dirName = process.argv[3] || '.';
    const songURL = await getDownloadLink(fileName);
    console.log(songURL);

    var req = https.request(songURL);
    var dir = dirName;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const file = fs.createWriteStream(`${dir}/${fileName}.mp3`);

    req.on('response', function (res) {
        var len = parseInt(res.headers['content-length'], 10);
        res.pipe(file);

        var bar = new ProgressBar('  Downloading '+fileName+' [:bar] :rate/bps :percent | Remaining Time: :etas', {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: len
        });

        res.on('data', function (chunk) {
            bar.tick(chunk.length);
        });

        res.on('end', function () {
            console.log(`\n${chalk.green(`Download complete.`)} ${dir}/${fileName}.mp3`);
        });
    });

    req.end();
})();