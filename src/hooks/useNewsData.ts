import { useState, useEffect, useCallback } from "react";
import api, { NewsArticle } from "../services/api";

interface UseNewsDataParams {
  country?: string;
  category?: string;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export default function useNewsData({
  country = "br",
  category = "business",
}: UseNewsDataParams = {}) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<NewsResponse>("/news/top-headlines", {
        params: { country, category },
      });

      setArticles(response.data.articles);
    } catch (e: any) {
      console.error("Erro ao buscar notícias:", e);
      setError("Não foi possível carregar as notícias.");
    } finally {
      setLoading(false);
    }
  }, [country, category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, fetchNews };
}
