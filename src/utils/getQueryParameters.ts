function getQueryParameters(limit: string | undefined, page: string | undefined, search: string | undefined) {
  limit = limit || (8).toString();
  page = page || (1).toString();
  search = search || '';
  const offset = Number(limit) * Number(page) - Number(limit);
  return { limit, page, search, offset };
}

export default getQueryParameters;
