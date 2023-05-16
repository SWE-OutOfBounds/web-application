import { User } from "./user.model";

describe('User', () => {
  let user: User;

  beforeEach(() => {
    // Create a new User instance before each test
    const tokenExpDate = new Date(); // Set the token expiration date
    tokenExpDate.setHours(tokenExpDate.getHours() + 1); // Add 1 hour to the current time
    user = new User('John Doe', 'john@example.com', 'sessionToken', tokenExpDate);
  });

  it('should return null if the token is expired', () => {
    // Set the token expiration date to a past date
    user['_tokenExpDate'] = new Date(2022, 0, 1);

    // Expect the token getter to return null
    expect(user.token).toBeNull();
  });

  it('should return the session token if it is still valid', () => {
    // Expect the token getter to return the session token
    expect(user.token).toBe('sessionToken');
  });

  it('should return null if the token expiration date is not set', () => {
    // Set the token expiration date to null
    user['_tokenExpDate'] = null;

    // Expect the token getter to return null
    expect(user.token).toBeNull();
  });
});
