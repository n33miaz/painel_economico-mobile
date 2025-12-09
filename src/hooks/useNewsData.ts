import { useState, useEffect, useCallback } from "react";
  import api, { NewsArticle } from "../services/api";

interface UseNewsDataParams {
  country?: string;
  category?: string;
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

      const response = await api.get("/news/top-headlines", {
        params: { country, category },
      });

      setArticles(response.data.articles);
    } catch (e: any) {
      setError("Erro ao carregar notícias.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [country, category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, fetchNews };
}
