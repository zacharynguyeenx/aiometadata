export function paginateAwardMetas(metas: any[], page: number, pageSize: number): any[] {
  return metas.slice(Math.max(0, (page - 1) * pageSize), page * pageSize);
}

export function filterAndPaginateAwardMetas<T>(
  metas: T[],
  filter: (meta: T) => boolean,
  skip: number,
  pageSize: number,
): T[] {
  return metas.filter(filter).slice(Math.max(0, skip), Math.max(0, skip) + pageSize);
}
