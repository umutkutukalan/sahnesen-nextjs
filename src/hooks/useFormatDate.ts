import { formatToIstanbul } from "@/utils/dateFormatter";

export const useFormatDate = () => {
  const formatDate = (dateString: string) => {
    return formatToIstanbul(dateString);
  };

  return { formatDate };
};
