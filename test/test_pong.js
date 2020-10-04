var expect = require('chai').expect;
var { toNumber, toString, code, decode } = require('../src/pong')

describe('Pong', function () {
  
  describe('#code()', function () {
    it("crypter une lettre", function () {
      expect(code('abced', 'biqka')).to.eql('\u0003');
    });
   
  });

});