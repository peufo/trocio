import { derived } from "svelte/store";
import { page } from "$app/stores";

export const param = derived(page, (_page) => {
  /** Return a merge of params and new params */
  const _with = (
    params: Record<string, string | number | undefined | boolean>,
    ...keysToRemove: string[]
  ) => {
    const url = new URL(_page.url);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    keysToRemove.forEach((key) => url.searchParams.delete(key));
    return url.search;
  };
  /** Return a new params search */
  const withOnly = (
    params: Record<string, string | number | undefined | boolean>,
    ...keysToKeep: string[]
  ) => {
    const url = new URL(_page.url.pathname);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    for (const key of keysToKeep) {
      const value = _page.url.searchParams.get(key);
      if (value) {
        url.searchParams.set(key, value);
      }
    }
    return url.search;
  };

  /** Return new url without params keys provided */
  const without = (...keys: string[]) => {
    const url = new URL(_page.url);
    keys.forEach((key) => url.searchParams.delete(key));
    return url.search;
  };

  /** Return new url with toggle params */
  const toggle = (
    params: Record<string, string>,
    ...keysToRemove: string[]
  ) => {
    const url = new URL(_page.url);
    Object.entries(params).forEach(([key, value]) => {
      if (url.searchParams.get(key) === value) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    });
    keysToRemove.forEach((key) => url.searchParams.delete(key));
    return url.search;
  };

  return {
    with: _with,
    withOnly: withOnly,
    without,
    toggle,
    /** Check if key exist in url params */
    has: (key: string) => _page.url.searchParams.has(key),
    get: (key: string) => _page.url.searchParams.get(key),
    /** Check if value match in url params */
    hasValue: (key: string, value: string) =>
      _page.url.searchParams.get(key) === value,
    page: _page,
  };
});

export const urlParam = derived(param, (_param) => {
  const { pathname } = _param.page.url;
  /** Return new url with new params */
  const _with = (
    params: Record<string, string | number | undefined | boolean>,
    ...keysToRemove: string[]
  ) => {
    return pathname + _param.with(params, ...keysToRemove);
  };

  /** Return new url without params keys provided */
  const without = (...keys: string[]) => {
    return pathname + _param.without(...keys);
  };

  /** Return new url with toggle params */
  const toggle = (
    params: Record<string, string>,
    ...keysToRemove: string[]
  ) => {
    return pathname + _param.toggle(params, ...keysToRemove);
  };

  return {
    ..._param,
    with: _with,
    without,
    toggle,
  };
});
