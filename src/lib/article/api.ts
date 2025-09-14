import type { Article, ArticleCreate } from "$lib/types";
import { api } from "$lib/api";

const FIRST_LIMIT = 10;
const NEXT_LIMIT = 20;

interface GetArticlesQuery {
  pageParam: number;
  queryKey: ["article", { trocId: string; search: string }];
}
/** @deprecated */
export function getArticles({ pageParam = 0, queryKey }: GetArticlesQuery) {
  const { trocId, search } = queryKey[1];
  console.log({ pageParam });
  const params = {
    trocId,
    search_name: search,
    skip: pageParam,
    limit: pageParam ? NEXT_LIMIT : FIRST_LIMIT,
  };
  return api<Article[]>("/api/articles", { params });
}

/**
 * Création d'un article
 * @deprecated
 */
export function createArticle(article: ArticleCreate) {
  return api<ArticleCreate, Article>("/api/articles", {
    method: "post",
    data: article,
    success: "Article ajouté",
  });
}

/**
 * Création d'articles
 *  @deprecated
 */
export function createArticles(article: ArticleCreate[]) {
  return api<ArticleCreate[], Article[]>("/api/articles", {
    method: "post",
    data: article,
    success: `${article.length} article${article.length > 1 ? "s" : ""} ajouté${
      article.length > 1 ? "s" : ""
    }`,
  });
}
