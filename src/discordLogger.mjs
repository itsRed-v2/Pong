export default class DiscordLogger {

	static instance = new DiscordLogger();

	setLogChannel(channel) {
		this.logChannel = channel;
	}

	sendAsLog(string) {
		return this.logChannel.send(string);
	}

	async logReloadMessage() {
		const lastMessage = await this.getLastMessage();
		const content = lastMessage.content;
		if (content.match(/^:repeat: Reloading/)) {
			const match = content.match(/(\d*)\)$/);
			if (match)
				return lastMessage.edit(`:repeat: Reloading (x${parseInt(10, match[1]) + 1})`);
			else
				return lastMessage.edit(':repeat: Reloading (x2)');

		}
		else {
			return this.logChannel.send(':repeat: Reloading');
		}
	}

	async getLastMessage() {
		let lastMessage;
		await this.logChannel.messages.fetch({ limit: 1 }).then(messages => {
			lastMessage = messages.first();
		});
		return lastMessage;
	}

}