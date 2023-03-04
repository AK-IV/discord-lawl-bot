const readline = require('readline');
const { Client } = require('discord.js-selfbot-v13');
const { bigZ, glowingZ } = require('./messages');
const fs = require('fs');

const client = new Client({
	// See other options here
	// https://discordjs-self-v13.netlify.app/#/docs/docs/main/typedef/ClientOptions
	// All partials are loaded automatically
	checkUpdate: false,
});

const readFile = fs.readFileSync('./token.txt', 'UTF-8');
console.log('token', readFile);

const token = readFile.split(/\r?\n/)[0];

client.login(token);

const MESSAGE_DELAY = 300;

let selectedGuild = 0;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const waitForUserInput = () => {
	rl.question("Command: ", async (userInput) => {

		if (userInput == "exit") {
			rl.close();
			process.exit();

		} else if (userInput === 'donbass') {
			console.log('DONBASS!!!!!');
			massiveDonbassZ(glowingZ);

		} else if (userInput === 'donbass2') {
			console.log('DONBASS SECOND!!!!!');
			massiveDonbassZ(bigZ);

		} else if (userInput === 'changeguild') {
			await retryPromiseUntilSuccess(handleGuildSelection);

		} else {
			console.log('Unknown command sorry');
		}

		waitForUserInput();
	});
}

const handleGuildSelection = async () => {
	const guilds = client.guilds;
	let guildCount = 0;
	guilds.cache.forEach((guild) => {
		guildCount++;
		console.log(guildCount + '.', guild.name);
	});

	return new Promise((resolve, reject) => {
		rl.question("Select guild (type in the number): ", async (userInput) => {
			const selection = Number(userInput);
			if (selection) {
				selectedGuild = selection - 1;
				if (!client.guilds.cache.at(selectedGuild)) {
					console.log('----------------------------------');
					console.log('Wrong guild number!, Select again:');
					reject();
				} else {
					console.log('##################################');
					console.log('##### Selected', client.guilds.cache.at(selectedGuild).name, '#####');
					console.log('##################################');
					resolve();
				}
			} else {
				console.log('----------------------------------');
				console.log('Not a number!!!');
				reject();
			}
		});
	});
}

const massiveDonbassZ = (message) => {

	const guilds = client.guilds;
	// use selected guild
	const targetGuild = guilds.cache.at(selectedGuild);
	console.log('Guild to Donbass:', targetGuild.name);
	console.log('----------------');

	const allGuildTextChannels = targetGuild.channels.cache
		.filter(c => c.guild && c.type === 'GUILD_TEXT');

	let counter = 0;
	allGuildTextChannels.forEach(channel => {
		setTimeout(() => {
			const permissions = channel.permissionsFor(client.user);
			console.log('channel', channel.name);
			console.log('has write?', permissions.has('SEND_MESSAGES'));

			if (permissions.has('SEND_MESSAGES')) {
				channel.send(message).then().catch(console.error);
			};
		}, MESSAGE_DELAY * counter++);
	});
}

retryPromiseUntilSuccess = (func) => {
	return new Promise((resolve, reject) => {
		func()
			.then(resolve)
			.catch(() => {
				retryPromiseUntilSuccess(func).then(resolve);
			})
	})
}

client.on('ready', async () => {
	console.log('----------------------------------');
	console.log(`${client.user.username} is ready!`);
	console.log('----------------------------------');

	await retryPromiseUntilSuccess(handleGuildSelection);
	console.log('Waiting for user input...');
	waitForUserInput();
});