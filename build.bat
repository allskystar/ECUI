java -jar smarty4j.jar src/ecui.js -l //{ -r }// -c utf-8 -o release/ecui-2.0.0-all.js
java -jar webpacker.jar release/ecui-2.0.0-all.js -o release/ecui-2.0.0.js --charset utf-8
java -jar webpacker.jar release/ecui-2.0.0-all.js -o release/ecui-2.0.0-br.js --line-break --charset utf-8