const expect = require('chai').expect;
var request = require('supertest')("http://localhost:8081");
const nock = require('nock');


describe("Testing the API", function () {

  it("GET /messages returns a 200 when get message", function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8081")
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
    nock("http://localhost:8081")
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
  
  it("Get /state returns a 200 when called", function (done) {
    nock("http://localhost:8081")
      .get('/state')
      .reply(200, "PAUSED");
    request
      .get('/state')
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        expect(res.text).not.to.be.null;
        done();

      });
  })
  
  it("Get /run-log returns a 200 when called", function (done) {
    nock("http://localhost:8081")
      .get('/run-log')
      .reply(200, "2020-11-19T18:05:36.037Z: INIT");
    request
      .get('/run-log')
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        expect(res.text).not.to.be.null;
        done();
      });
  })
});

