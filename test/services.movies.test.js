const assert = require('assert')
const proxyquery = require('proxyquire')

const { MongoLibMock, getAllStub } = require('../utils/mocks/mongoLib')

const { moviesMock } = require('../utils/mocks/movies')

describe("services - movies", function() {
  const MoviesService = proxyquery('../services/movies', {
    '../lib/mongo': MongoLibMock
  })
  
  const moviesService = new MoviesService()

  describe("When getMovies method is called", async function() {
    it('should call the getAll MongoLib method', async function() {
      await moviesService.getMovies({})
      assert.strictEqual(getAllStub.called, true)
    })

    it('should return an array of movies', async function() {
      const result = await moviesService.getMovies({})
      const expected = moviesMock
      assert.deepEqual(result, expected)
    })
  })
})