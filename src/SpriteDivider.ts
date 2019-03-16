import sharp = require("sharp");
import cli = require("cli");
import fs = require("fs");

cli.setUsage("SpriteDivider.js sprite.json");
cli.parse({});

let jsonFile = cli.args[0];
if (!jsonFile) {
	cli.error("image file must be specified");
	cli.exit(-1);
}

fs.readFile(jsonFile, (err, data) => {
	if (err) {
		cli.error(err.message);
		cli.exit(-1);
	}
	let frameData = JSON.parse(data.toString());
	let outPath = frameData.meta.prefix;
	let images = frameData.meta.image.split(",");
	let tmp = [];
	for (let i = 0; i < images.length; i++) {
		tmp.push(sharp(images[i]));
	}
	images = tmp;

	if (!fs.existsSync(outPath)) {
		fs.mkdirSync(outPath);
	}
	
	let frames = frameData.frames;
	for (const key in frames) {
		const rect = frames[key].frame;
		let texture:sharp.Sharp = images[rect.idx];
		if (!texture) continue;

		texture.clone().extract({
			left: rect.x, top: rect.y, width: rect.w, height: rect.h
		}).toFile(outPath + key).catch(err => {
			console.log(err.message);
		});
	}
});


