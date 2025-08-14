import { UserAuth } from "../types/auth";

export class UserSingleton {
  private static instance: UserSingleton;
  private user: UserAuth | null = null;
  private id: string | null = null;

  private constructor() {}

  public static getInstance(): UserSingleton {
    if (!UserSingleton.instance) {
      UserSingleton.instance = new UserSingleton();
    }
    return UserSingleton.instance;
  }

  public setId(id: string | null): void {
    this.id = id;
  }

  public async setUser(user_data: UserAuth | null) {
    if (user_data) {
      this.id = user_data.id;
      this.user = user_data;
    } else {
      this.user = null;
      this.id = null;
    }
  }

  public getUser(): UserAuth | null {
    console.log(this.user);
    return this.user;
  }

  public getId(): string | null {
    return this.id;
  }
}
