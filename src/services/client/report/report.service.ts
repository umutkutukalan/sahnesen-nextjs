import api from "../config";

export interface ReportRequest {
  targetId: number;
  reportType: "POST" | "COMMENT" | "USER";
  reason: string;
}

export const reportService = {
  createReport: async (data: ReportRequest) => {
    const response = await api.post("/api/reports", data);
    return response.data;
  },
};
