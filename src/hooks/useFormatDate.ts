export const useFormatDate = () => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("tr-TR", { day: "2-digit" });
    const month = date.toLocaleDateString("tr-TR", { month: "short" });
    const year = date.toLocaleDateString("tr-TR", { year: "numeric" });

    return `${month} ${day}, ${year}`;
  };

  return { formatDate };
};
