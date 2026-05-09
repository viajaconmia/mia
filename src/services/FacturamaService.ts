import { ApiResponse, ApiService } from "./ApiService";
// import { UserSingleton } from "./UserSingleton";

export class FacturamaService extends ApiService {
  // private user: UserSingleton = UserSingleton.getInstance();
  private static instance: FacturamaService;
  private ENDPOINTS = {
    POST: {
      DOWNLOAD: "/download",
      DOWNLOAD_XML: "/downloadXML",
    },
  };
  private constructor() {
    super("/v1/factura");
    // this.user = UserSingleton.getInstance();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new FacturamaService();
    }
    return this.instance;
  }

  public downloadCFDI = async ({
    id,
    type,
  }: {
    id: string;
    type: "xml" | "pdf";
  }): Promise<ApiResponse<ArchivoBase64>> =>
    this.post<ArchivoBase64>({
      path: this.formatPath(this.ENDPOINTS.POST.DOWNLOAD),
      body: { cfdi_id: id, type },
    });

  public downloadXML = async (cfdi_id: string): Promise<ApiResponse<ArchivoBase64>> =>
    this.post<ArchivoBase64>({
      path: this.formatPath(this.ENDPOINTS.POST.DOWNLOAD_XML),
      body: { cfdi_id },
    });
}

export type ArchivoBase64 = {
  ContentEncoding: "base64"; // siempre base64
  ContentType: "pdf" | "xml"; // tipo de archivo
  ContentLength: number; // tamaño en bytes
  Content: string; // contenido en base64
};
