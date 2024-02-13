export const validateUser = (user: unknown) => {
  const allowedKeys = ['username', 'age', 'hobbies'];
  const errorArray: string[] = [];

  if (user === null || typeof user !== 'object') {
    errorArray.push('User should be a valid object');
  } else {
    if (!('username' in user && typeof user.username === 'string')) {
      errorArray.push('Username should be type of string');
    }
    if (!('age' in user && typeof user.age === 'number')) {
      errorArray.push("User's age should be type of number");
    }
    if (
      !(
        'hobbies' in user &&
        Array.isArray(user.hobbies) &&
        user.hobbies.every((hobby: unknown) => typeof hobby === 'string')
      )
    ) {
      errorArray.push(
        "User's hobbies should be and array of strings or empty array",
      );
    }
    for (const key in user) {
      if (!allowedKeys.includes(key)) {
        errorArray.push(
          `User object should contain only this keys: ${allowedKeys.join(', ')}`,
        );
        break;
      }
    }
  }

  return { isValidUser: errorArray.length > 0 ? false : true, errorArray };
};
