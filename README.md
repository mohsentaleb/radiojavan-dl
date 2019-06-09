# Radio Javan Downloader
This tool simply allows you download a song from [RadioJavan](https://www.radiojavan.com) website. Downloading album/playlist is not supported yet but I'm planning to do that in near future.

# Running as CLI
## Installation
```shell
npm install radiojavan-dl -g
```

## Usage
```
radiojavan-dl <song-url|podcast-url> [<directory>]
```
Example: 
```shell
radiojavan-dl https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani
```
This will save `Ebi-Jane-Javani.mp3` in your current directory. However if you want to save it in a different directory, provide it as the second parameter.
```shell
radiojavan-dl https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani temp
```
Which will store the file under `./temp`

# Licence
MIT