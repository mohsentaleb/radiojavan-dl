#!/usr/bin/env node
const chalk = require('chalk');
const request = require('request-promise');
const ProgressBar = require('progress');
const https = require('https');
const fs = require('fs');

async function processLink(link, dirName = '.') {
    let mediaType = link.split('/')[4];
    let fileName = link.split('/')[5];

    // When playing a playlist or songs of a specific artist, url may have some extra parameters. Let's get rid of them first
    let urlParams = fileName.indexOf('?');
    if (urlParams !== -1) {
        fileName = fileName.substr(0, urlParams);
    }

    try {
        let uri, songURL, result;

        switch (mediaType) {
            case "podcast":
                uri = 'https://www.radiojavan.com/podcasts/podcast_host/?id=';
                result = await request({"method": "GET", "uri": uri + fileName,"json": true});
                songURL = `${result.host}/media/podcast/mp3-256/${fileName}.mp3`;
                console.log('Downloading ' + mediaType, chalk.blue(songURL));
                downloadFileWithProgressBar(songURL, fileName, dirName);
                break;
        
            case "mp3":
                uri = 'https://www.radiojavan.com/mp3s/mp3_host/?id=';
                result = await request({ "method": "GET", "uri": uri + fileName, "json": true });
                songURL = `${result.host}/media/mp3/${fileName}.mp3`;
                console.log('Downloading ' + mediaType, chalk.blue(songURL));
                downloadFileWithProgressBar(songURL, fileName, dirName);
                break;
            case "playlist": 
                console.log('downloading playlist is not supported yet.');
                process.exit(0);

                /* var req = https.request(link, function (res) {
                    var data = '';
                    res.on('data', function (chunk) {data += chunk;});
                    res.on('end', function () {
                         var links = extractLinks(data);
                         console.log(links);
                    });
                });
                req.on('error', function (e) {
                    console.log(e.message);
                });
                req.end(); */
        }
    } catch(err) {
        if (err.name === 'RequestError') {
            console.log('There was a problem connecting to radiojavan servers. Please check your internet connection OR if you are in Iran you know what to do :)');
            process.exit(1);
        } else {
            console.log(err);
        }
    }
}

function downloadFileWithProgressBar(url, fileName, dirName) {
    var req = https.request(url);

    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
    }
    const file = fs.createWriteStream(`${dirName}/${fileName}.mp3`);
    req.on('response', function (res) {
        var len = parseInt(res.headers['content-length'], 10);
        var humanReadableLen = (len / 1048576).toFixed(1) + ' MiB';
        res.pipe(file);
        var bar = new ProgressBar(humanReadableLen + ' [:bar] :rate :percent | Remaining Time: :etas', {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: len,
            humanFriendlyRate: true
        });
        res.on('data', function (chunk) {
            bar.tick(chunk.length);
        });
        res.on('end', function () {
            console.log(`\n${chalk.green(`Download complete.`)} ${dirName}/${fileName}.mp3`);
        });
    });
    req.end();
}

if (process.argv.length < 3) {
    console.log(`Usage: radiojavan-dl <song-url|podcast-url> [<directory>]
Example: ${chalk.blue('radiojavan-dl https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani')}
         ${chalk.blue('radiojavan-dl https://www.radiojavan.com/podcasts/podcast/Dubways-103')}`);
    process.exit(1);
}
const link = process.argv[2];
const directory = process.argv[3]
processLink(link, directory);
