#!/usr/bin/env node
const chalk = require('chalk');
const RadioJavan = require('./helpers/radiojavan');

if (process.argv.length < 3) {
    console.log(`Usage: radiojavan-dl <song-url|podcast-url|playlist-url> [<directory>]
Examples: ${chalk.blue('radiojavan-dl https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani')}
          ${chalk.blue('radiojavan-dl https://www.radiojavan.com/podcasts/podcast/Dubways-103')}
          ${ chalk.blue('radiojavan-dl https://www.radiojavan.com/playlists/playlist/mp3/25638be976b4')}`);
    process.exit(1);
}
const radioJavan = new RadioJavan();
const link = process.argv[2];
const directory = process.argv[3]

radioJavan.dispatch(link, directory);