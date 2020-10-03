var expect = require('chai').expect;
var { toNumber, toString, code, decode } = require('../src/pong')

describe('Pong', function () {
  describe('#toNumber()', function () {
    it("retourne les nombres correspondants aux lettres", function () {
      expect(toNumber('abc')).to.eql([11, 12, 13]);
    });
    it("retourne la lettre elle même si elle n'a pas de code", function () {
      expect(toNumber('z!')).to.eql([36, '!']);
    });
  });

  describe('#toString()', function () {
    it("retourne les lettres correspondants aux nombres", function () {
      expect(toString([11, 12, 13])).to.eql('abc');
    });
    it("retourne la lettre elle même si elle n'a pas de code", function () {
      expect(toString([36, '!'])).to.eql('z!');
    });
  });

  describe('#code()', function () {
    it("multiplie les nombres par le nombre précédent ou la clé", function () {
      expect(code([12, 1, 0], 2)).to.eql([26, 17, 18]);
    });
    it("0", function () {
      expect(code([0], 2)).to.eql([2]);
    });
    it("lettre seul", function () {
      expect(code(['!'], 2)).to.eql(['!']);
    });
    it("lettre puis chiffre", function () {
      expect(code(['!', 1], 2)).to.eql(['!', 4]);
    });
    it("lettre au milieu", function () {
      expect(code([1, '!', 1], 2)).to.eql([4, '!', 10]);
    });
    it("lettres à la fin", function () {
      expect(code([1, 1, '!', '!'], 2)).to.eql([4, 10, '!', '!']);
    });
  });

  describe('#decode()', function () {
    it("divise les nombres par le nombre précédent ou la clé", function () {
      expect(decode([26, 17, 18], 2)).to.eql([12, 1, 0]);
    });
    /*it("0", function () {
      expect(decode([0], 2)).to.eql([2]);
    });
    it("lettre seul", function () {
      expect(decode(['!'], 2)).to.eql(['!']);
    });
    it("lettre puis chiffre", function () {
      expect(decode(['!', 1], 2)).to.eql(['!', 4]);
    });
    it("lettre au milieu", function () {
      expect(decode([1, '!', 1], 2)).to.eql([4, '!', 10]);
    });
    it("lettres à la fin", function () {
      expect(decode([1, 1, '!', '!'], 2)).to.eql([4, 10, '!', '!']);
    }); */
  });

});