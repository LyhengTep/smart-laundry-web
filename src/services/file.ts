import { http } from "@/lib/axios";
import { FileResponse } from "@/types/fileType";

export const uploadFile = async (file: File): Promise<FileResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await http.post("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
