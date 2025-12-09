import { useState, useEffect, useCallback } from "react";

import api from "../services/api"; 
import { NewsArticle } from "../services/api";

interface UseNewsDataParams {
  country?: string;
  category?: string;
  pageSize?: number;
}

interface UseNewsDataResult {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  fetchNews: () => Promise<void>;
}

export default function useNewsData({
  country = "br",
  category = "business",
  pageSize = 10,
}: UseNewsDataParams): UseNewsDataResult {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/news/top-headlines", {
        params: { country, category, pageSize },
      });
      setArticles(response.data.articles);
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message || "Não foi possível carregar as notícias.";
      setError(errorMessage);
      console.error("Erro ao buscar notícias:", e.response?.data || e);
    } finally {
      setLoading(false);
    }
  }, [country, category, pageSize]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, fetchNews };
}