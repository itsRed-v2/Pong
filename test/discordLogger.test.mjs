import chai from 'chai';
const expect = chai.expect;
import DiscordLogger from '../src/discordLogger.mjs';

describe('DiscordLogger', function() {

	describe('#sendAsLog()', function() {
		it('envoie le message dans le salon de logs', function() {
			let sendRuns = 0;

			DiscordLogger.instance.setLogChannel({
				async send(s) {
					expect(s).to.eql('message de log');
					sendRuns++;
					return Promise.resolve();
				},
			});

			DiscordLogger.instance.sendAsLog('message de log').then(() => {
				expect(sendRuns).to.eql(1);
			});
		});
	});

	describe('#logReloadMessage()', function() {
		it('log premier reload message', function() {
			let editRuns = 0;
			let sendRuns = 0;

			DiscordLogger.instance.getLastMessage = async () => {
				return {
					content: 'Message quelconque',
					async edit() {
						editRuns++;
					},
				};
			};

			DiscordLogger.instance.setLogChannel({
				async send(s) {
					expect(s).to.eql(':repeat: Reloading');
					sendRuns++;
				},
			});

			DiscordLogger.instance.logReloadMessage().then(() => {
				expect(editRuns).to.eql(0);
				expect(sendRuns).to.eql(1);
			});
		});
		it('log deuxième reload message', function() {
			let editRuns = 0;
			let sendRuns = 0;

			DiscordLogger.instance.getLastMessage = async () => {
				return {
					content: ':repeat: Reloading',
					async edit(s) {
						expect(s).to.eql(':repeat: Reloading (x2)');
						editRuns++;
					},
				};
			};

			DiscordLogger.instance.setLogChannel({
				async send() {
					sendRuns++;
				},
			});

			DiscordLogger.instance.logReloadMessage().then(() => {
				expect(editRuns).to.eql(1);
				expect(sendRuns).to.eql(0);
			});
		});
		it('log 2+ reload message', function() {
			let editRuns = 0;
			let sendRuns = 0;

			DiscordLogger.instance.getLastMessage = async () => {
				return {
					content: ':repeat: Reloading (x6)',
					async edit(s) {
						expect(s).to.eql(':repeat: Reloading (x7)');
						editRuns++;
					},
				};
			};

			DiscordLogger.instance.setLogChannel({
				async send() {
					sendRuns++;
				},
			});
			DiscordLogger.instance.logReloadMessage().then(() => {
				expect(editRuns).to.eql(1);
				expect(sendRuns).to.eql(0);
			});
		});
	});

});