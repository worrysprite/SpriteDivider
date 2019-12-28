#!/usr/bin/env node
import sharp = require("sharp");
import cli = require("cli");
import fs = require("fs");
import path = require("path");

cli.setUsage("SpriteDivider.js [OPTIONS] <sprite.json>");
cli.parse({
	format: ['f', 'spritesheet format, support: TexturePacker, egret.', 'string', 'TexturePacker']
});

let jsonFile = cli.args[0];
if (!jsonFile || path.extname(jsonFile) != ".json") {
	cli.error("spritesheet json must be specified!");
	cli.exit(-1);
}

let format = cli.options.format;
let basedir = path.dirname(jsonFile);
fs.readFile(jsonFile, (err, data) => {
	if (err) {
		cli.error(err.message);
		cli.exit(-1);
	}
	switch (format) {
		case 'TexturePacker':
			readTexturePackerFormat(JSON.parse(data.toString()));
			break;
	
		case 'egret':
			readEgretFormat(JSON.parse(data.toString()));
			break;
	
		default:
			cli.error("unsupported spritesheet format!");
			cli.exit(-1);
			break;
	}
});


function readTexturePackerFormat(frameData) {
	let outPath = path.resolve(basedir, frameData.meta.prefix);
	let images = frameData.meta.image.split(",");
	let tmp = [];
	for (let i = 0; i < images.length; i++) {
		tmp.push(sharp(path.resolve(basedir, images[i])));
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
}

function readEgretFormat(frameData) {
	let image = sharp(path.resolve(basedir, frameData.file));
	if (!image) {
		cli.error(`image ${frameData.file} not found!`);
		cli.exit(-1);
	}
	
	let outPath = path.resolve(basedir, path.basename(jsonFile, '.json'));
	if (!fs.existsSync(outPath)) {
		fs.mkdirSync(outPath);
	}
	
	let frames = frameData.frames;
	for (const key in frames) {
		const frame = frames[key];
		const fileName = key.replace(/_png$/, '.png').replace(/_jpg$/, '.jpg');
		image.clone().extract({
			left: frame.x, top: frame.y, width: frame.w, height: frame.h
		}).toFile(path.resolve(outPath, fileName)).catch(err => {
			console.log(err.message);
		});
	}
}



