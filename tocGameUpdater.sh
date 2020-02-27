killall tocGame
cd /home/hit
mkdir tocGameTemporalDownload
cd tocGameTemporalDownload
git clone --depth 1 https://github.com/dobleamarilla/tocGame.git
cd tocGame
npm install
npx electron-rebuild -f -p
npm run build:linux
cd linuxBuild
mv tocGame-linux-x64 tocGame
killall tocGame
cp -f -r tocGame /home/hit
rm -rf /home/hit/tocGameTemporalDownload
cd /home/hit/tocGame
killall tocGame
./tocGame