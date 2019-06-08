# Radio Javan Downloader
This tool simply allows you download a song from [RadioJavan](https://www.radiojavan.com) website. Downloading album/playlist is not supported yet but I'm planning to do that in near future.

# Installation
```shell
git clone https://github.com/mohsentaleb/radiojavan-dl.git
cd radiojavan-dl
npm install
```

# Usage
```shell
node app.js <url> [<directory>]
```
Example:
```shell
node app.js https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani
```
**Note:** If you want to download the file in a directory *relative* to your working directory just provide it as the third param in your command:
```shell
node app.js https://www.radiojavan.com/mp3s/mp3/Ebi-Jane-Javani temp
```
This will put `Ebi-Jane-Javani.mp3` in `./temp`.

# Licence
MIT