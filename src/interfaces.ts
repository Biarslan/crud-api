export interface IUser {
  username: string;
  age: number;
  hobbies: string[];
}

export interface IUserDB extends IUser {
  id: string;
}
