function getQueryParameters(limit: string | undefined, page: string | undefined, search: string | undefined) {
  limit = limit || (8).toString();
  page = page || (1).toString();
  search = (search && search[0].toUpperCase() + search.slice(1)) || '';
  const offset = Number(limit) * Number(page) - Number(limit);
  return { limit, page, search, offset };
}

export default getQueryParameters;
