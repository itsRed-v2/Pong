var expect = require('chai').expect;
var { code, decode, litCode} = require('../src/pong')

describe('Pong', function () {
  
  describe('#code()', function () {
    it("crypter une lettre", function () {
      expect(code('a', 'b')).to.eql([3]);
    });
    it("crypter plusieurs lettres", function () {
      expect(code('abcd', 'b')).to.eql([3, 0, 1, 6]);
    });
    it("crypter avec une clé de plusieurs lettres", function () {
      expect(code('abcd', 'ab')).to.eql([0, 0, 2, 6]);
    });
  });

  describe('#decode()', function () {
    it("decrypter une lettre", function () {
      expect(decode([3], 'b')).to.eql('a');
    });
    it("décrypter plusieurs lettres", function () {
      expect(decode([3, 0, 1, 6], 'b')).to.eql('abcd');
    });
  });

});