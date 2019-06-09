#!/usr/bin/env node
const chalk = require('chalk');
const request = require('request-promise');
const ProgressBar = require('progress');
const https = require('https');
const fs = require('fs');

if (process.argv.length < 3) {
    console.log(`Usage: radiojavan-dl <song-url|podcast-url> [<directory>]\n\rExample: ${chalk.blue('radiojavan-dl https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani')}`);
    process.exit(1);
}

async function getDownloadLink(fileName, mediaType) {
    try {
        let uri, songURL, result;

        switch (mediaType) {
            case "podcasts":
                uri = 'https://www.radiojavan.com/podcasts/podcast_host/?id=';
                result = await request({
                    "method": "GET",
                    "uri": uri + fileName,
                    "json": true
                });
                songURL = `${result.host}/media/podcast/mp3-256/${fileName}.mp3`;

                break;
        
            case "mp3s":
                uri = 'https://www.radiojavan.com/mp3s/mp3_host/?id=';
                result = await request({
                    "method": "GET",
                    "uri": uri + fileName,
                    "json": true
                });
                songURL = `${result.host}/media/mp3/${fileName}.mp3`;
                break;
        }
        return songURL;

    } catch(err) {
        if (err.name === 'RequestError') {
            console.log('There was a problem connecting to radiojavan servers. Please check your internet connection OR be sure you are using a proxy if you are in Iran :)');
            process.exit(1);
        } else {
            console.log(err);
        }
    }
}

(async() => {
    const mediaType = process.argv[2].split('/')[3];
    const fileName = process.argv[2].split('/')[5];
    const dirName = process.argv[3] || '.';
    const songURL = await getDownloadLink(fileName, mediaType);
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