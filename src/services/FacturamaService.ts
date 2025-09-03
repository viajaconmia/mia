import { ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class FacturamaService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: FacturamaService;
  private ENDPOINTS = {
    GET: {},
  };
  private constructor() {
    super("/v1/facturama");
    this.user = UserSingleton.getInstance();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new FacturamaService();
    }
    return this.instance;
  }
}
