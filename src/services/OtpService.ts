import { ApiService } from "./ApiService";

export class OtpService extends ApiService {
  private ENDPOINTS = {
    GET: { verificarOtp: "/verify-otp" },
    POST: { create_otp: "/send-otp-pass" },
  };

  constructor() {
    super("/v1/otp");
  }

  async verificarOtp(email: string, code: string) {
    const path = this.formatPath(this.ENDPOINTS.GET.verificarOtp);
    return await this.get<{ isValid: boolean }>({
      path,
      params: { email, code },
    });
  }

  async crear(email: string) {
    const path = this.formatPath(this.ENDPOINTS.POST.create_otp);
    return this.post<null>({ path, body: { email } });
  }
}
