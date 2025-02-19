import { Assets } from "@/app/types/vaporwaver";
import { useQuery } from "@tanstack/react-query";

export const useAssets = () => {
    return useQuery<Assets>({
        queryKey: ["assets"],
        queryFn: async () => {
            const res = await fetch("/api/assets");
            if (!res.ok) throw new Error("Failed to fetch assets");
            return res.json();
        },
        staleTime: 5 * 60 * 1000
    });
};