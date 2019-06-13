const chalk = require('chalk');
const ProgressBar = require('progress');
const https = require('https');
const fs = require('fs');
const { default: PQueue } = require('p-queue');
const util = require('util');
const got = require('got');

class RadioJavan {

    dispatch(link, dirName = '.') {
        let mediaType = link.split('/')[4];
        let fileName = link.split('/')[5];

        // When playing a playlist or songs of a specific artist, the url in the address bar may have
        // some extra parameters (for tracking the next/prev song or the current playlist). Let's get
        // rid of them first.
        let urlParams = fileName.indexOf('?');
        if (urlParams !== -1) {
            fileName = fileName.substr(0, urlParams);
        }

        try {
            switch (mediaType) {
                case "podcast":
                    this.downloadPodcast(fileName, dirName);
                    break;
                case "mp3":
                    this.downloadMp3(fileName, dirName);
                    break;
                case "playlist":
                    let playlistId = link.split('/')[6]
                    this.downloadPlaylist(playlistId);
            }
        } catch (err) {
            if (err.name === 'RequestError') {
                console.log('There was a problem connecting to radiojavan servers. Please check your internet connection OR if you are in Iran you know what to do :)');
                process.exit(1);
            } else {
                console.log(err);
            }
        }
    }

    async downloadMp3(fileName, dirName, callback = () => { }) {
        var download = util.promisify(this.downloadFileWithProgressBar);
        const uri = 'https://www.radiojavan.com/mp3s/mp3_host/?id=' + fileName;
        var result = await got(uri, { json: true });

        try {
            var songURL = `${result.body.host}/media/mp3/${fileName}.mp3`;
            console.log('Downloading mp3 ', chalk.blue(songURL));
            download(songURL, fileName, dirName, function (err, data) {
                if (err) {
                    callback(err);
                }
                console.log(`${chalk.green(`Download completed.`)} Saved to ${dirName}/${fileName}.mp3\n`);
                callback();
            });
        } catch (err) {
            console.log(`Something bad happened while trying to get the download link for file "${fileName}"...`);
            console.log(err);
        }
    }

    async downloadPodcast(fileName, dirName, callback) {
        const download = util.promisify(this.downloadFileWithProgressBar);
        const uri = 'https://www.radiojavan.com/podcasts/podcast_host/?id=' + fileName;
        var result = await got(uri, { json: true });

        try {
            var songURL = `${result.body.host}/media/podcast/mp3-256/${fileName}.mp3`;
            console.log('Downloading podcast ', chalk.blue(songURL));
            download(songURL, fileName, dirName, function (err, data) {
                if (err) {
                    callback(err);
                }
                console.log(`${chalk.green(`Download completed.`)} Saved to ${dirName}/${fileName}.mp3\n`);
                callback();
            });
        } catch (err) {
            console.log(`Something bad happened while trying to get the download link for file "${fileName}"...`);
            console.log(err);
        }
    }

    async downloadPlaylist(playlistId) {
        const page = await got('https://www.radiojavan.com/mp3s/playlist_start?id=' + playlistId + '&index=0');
        var songIds = this.extractSongIdsFromPage(page.body);
        var playlistTitle = this.getPlaylistTitle(page.body, playlistId);
        var promisifiedDownloadMp3 = util.promisify(this.downloadMp3).bind(this);

        if (songIds.length) {
            console.log(`Downloading playlist "${playlistTitle}" (${songIds.length} songs)...`);
            const queue = new PQueue({ concurrency: 1 });
            songIds.forEach(async (songId) => {
                // In case the file has already been downloaded, skip it.
                // This can be useful when downloading has been interrupted and you want to resume it.
                if (!fs.existsSync(playlistTitle + '/' + songId + '.mp3')) {
                    await queue.add(() => promisifiedDownloadMp3(songId, playlistTitle));
                }
            });
        } else {
            console.log(`There's no songs in "${playlistTitle}" playlist.`);
            process.exit(1);
        }
    }



    extractSongIdsFromPage(page) {
        var regexp = /href=\"\/mp3s\/mp3\/(.*)\?/g;
        var match;
        var matchesArray = [];
        while (match = regexp.exec(page)) {
            matchesArray.push(match[1]); // get the string inside the parentheses. Access the whole match via match[0]
        }
        return matchesArray;
    }

    getPlaylistTitle(page, playlistId) {
        // Finding playlist name in breadcrumb html: e.g. <li><a href="/playlists/playlist/mp3/25638be976b4">Mega Hit Mix</a></li>
        var regexp = new RegExp(playlistId + '\">(.*)<\/a', "g");
        return regexp.exec(page)[1];
    }

    downloadFileWithProgressBar(url, fileName, dirName, cb) {
        var req = https.request(url);

        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
        }
        const file = fs.createWriteStream(`${dirName}/${fileName}.mp3`);
        req.on('response', function (res) {
            var len = parseInt(res.headers['content-length'], 10);
            var humanReadableLen = (len / 1048576).toFixed(1) + ' MiB'; // 1048576 = 2^20 (Bytes to MebiBytes)
            res.pipe(file);
            var bar = new ProgressBar(fileName + '(' + humanReadableLen + ')' + ' [:bar] :rate :percent | Remaining Time: :etas', {
                complete: '=',
                incomplete: ' ',
                width: 40,
                total: len,
                humanFriendlyRate: true
            });
            res.on('data', function (chunk) {
                bar.tick(chunk.length);
            });
            res.on('end', function (data) {
                cb();
            });
            res.on('error', function (err) {
                cb(err)
            });
        });
        req.end();
    }
}

module.exports = RadioJavan;