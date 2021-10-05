const { assert } = require('chai').assert;

const { findUserByEmail } = require('./helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    assert.equal(user, testUsers.user2RandomID);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = findUserByEmail('ghostperson@example.com', testUsers);
    assert.equal(user, undefined);
  });
});
