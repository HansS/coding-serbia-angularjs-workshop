'use strict';
var chai = require('chai');
var dirty = require('dirty');
var expect = chai.expect;
var sinon = require('sinon');
var ResponseMock = require('./helper/response-mock');

describe('getMovie', function () {
    var movieDbStub;
    var routes;
    var movies;
    var responseMock;

    beforeEach(function() {
        // Create stubs for the database API
        movieDbStub = sinon.createStubInstance(dirty.Dirty);

        // load the routes and inject the d-stub
        routes = require('../../server/routes')(movieDbStub, null);
        movies = routes.movies;

        // the ResponseMock behaves like an express.js response object,
        // it stores the data that would normally be sent to the client
        // and can be used to execute verifications on this data
        responseMock = new ResponseMock();
    });

    it('should return an empty list when db returns null', function (done) {
        // Now lets set up some verifications. This function will be called when
        // res.send is executed on the response mock
        responseMock.verify(function(responseData) {
            // the responseData object contains information about the
            // response, that would normally be sent to the client
            expect(responseData.status).to.equal(200);
            expect(responseData.body).to.be.instanceOf(Array);
            expect(responseData.body).to.be.empty;
            // last thing to do: notify mocha, that the test is now finished!
            done();
        });

        // execute the method we want to test and pass the ResponseMock object,
        // that will be used for verifications later
        movies.getMovies({}, responseMock);
    });

    it('should return movies', function (done) {

        movieDbStub.forEach.yields('movie-xyz', {
            title: 'Lord of the Rings',
            description: 'Description',
        });

        responseMock.verify(function(responseData) {
            expect(responseData.status).to.equal(200);
            expect(responseData.body).to.be.instanceOf(Array);
            expect(responseData.body).to.have.length(1);
            expect(responseData.body[0]).to.have.property('title')
                .that.equals('Lord of the Rings');
            done();
        });

        movies.getMovies({}, responseMock);
    });
});
