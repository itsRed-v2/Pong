import chai from 'chai';
const expect = chai.expect;
import {
	stringifyForExport
} from '../../src/file-tools.mjs';

describe('File tools', function () {

	describe('#stringifyForExport()', function () {
		it("convertis objet en string JSON prêt pour l'exportation", function () {
			var allhighscores = {
				mode_1: {
					'id1' : 155,
					'id2' : 120,
					'id3' : 83,
				},
				mode_2: {
					'id1' : 50,
					'id2' : 27,
				}
			}
			expect(stringifyForExport(allhighscores)).to.eql(
`export let data = {
  "mode_1": {
    "id1": 155,
    "id2": 120,
    "id3": 83
  },
  "mode_2": {
    "id1": 50,
    "id2": 27
  }
};`);
		});
	});
})