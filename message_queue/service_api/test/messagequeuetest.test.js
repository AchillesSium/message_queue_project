const expect = require('chai').expect;
var request = require('supertest')("http://localhost:8083");
const nock = require('nock');


describe("Testing the API", function () {

  it("GET /messages returns a 200 when get message", function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8083")
      //define the method
      .get('/messages/')
      //respond 200
      .reply(200, "2020-11-19T18:05:36.037Z Topic my.o:MSG_1 ");
    request
      .get('/messages/')
      .end(function (err, res) {
        //compare
        expect(res.status).to.equal(200);
        expect(res.text).not.to.be.null;
        done();
      });
  })

  it("PUT /state returns a 200 when called", function (done) {
    nock("http://localhost:8083")
      .put('/state?data=RUNNING')
      .reply(200, "PUT /state called ");
    request
      .put('/state?data=RUNNING')
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        expect(res.text).not.to.be.null;
        done();
      });
  })

  
});

