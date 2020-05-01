import { initDB } from '../helpers/utils';

type Entity = 'songs' | 'prayers' | 'ancillas';

const entityToIdFieldMap: { [key in Entity]: string } = {
  songs: 'number',
  prayers: 'slug',
  ancillas: 'code',
};

const entityToDetailFieldMap: { [key in Entity]?: string } = {
  songs: 'content',
  prayers: 'content',
};

const dbPromise = initDB();

const updateLocalDBSummaryData = async (
  request: Request,
  entity: Entity,
  cachedData: any[],
): Promise<Response> => {
  const db = await dbPromise;

  const idField = entityToIdFieldMap[entity];

  const response = await fetch(request);

  const clonedResponse = response.clone();

  const parsedResponse: any[] = await response.json();

  const newData = parsedResponse.map((data) => {
    const oldData = cachedData.find(
      ({ [idField]: id }) => id === data[idField],
    );

    return { ...oldData, ...data };
  });

  const deletedData = cachedData.filter((data) =>
    newData.every(({ [idField]: id }) => id !== data[idField]),
  );

  const transaction = db.transaction(entity, 'readwrite');

  const objectStore = transaction.objectStore(entity);

  newData.forEach((data) => objectStore.put(data));
  deletedData.forEach(({ id }) => objectStore.delete(id));

  await transaction.done;

  return clonedResponse;
};

const updateLocalDBDetailData = async (
  request: Request,
  entity: Entity,
  cachedData: any,
): Promise<Response> => {
  const db = await dbPromise;

  const response = await fetch(request);

  const clonedResponse = response.clone();

  const parsedResponse = await response.json();

  const newData = {
    ...cachedData,
    ...parsedResponse,
  };

  await db.put(entity, newData);

  return clonedResponse;
};

const getResponse = async (
  request: Request,
  entity: Entity,
  id?: string,
): Promise<Response> => {
  const db = await dbPromise;

  if (!id) {
    const cachedData = await db.getAll(entity);

    const localDBSummaryDataUpdatePromise = updateLocalDBSummaryData(
      request,
      entity,
      cachedData,
    );

    return cachedData.length > 0
      ? new Response(JSON.stringify(cachedData))
      : localDBSummaryDataUpdatePromise;
  }

  const cachedData = await db.get(entity, id);

  const localDBDetailDataUpdatePromise = updateLocalDBDetailData(
    request,
    entity,
    cachedData,
  );

  return cachedData &&
    (!entityToDetailFieldMap[entity] ||
      entityToDetailFieldMap[entity]! in cachedData)
    ? new Response(JSON.stringify(cachedData))
    : localDBDetailDataUpdatePromise;
};

self.addEventListener('fetch', (event) => {
  // For some reason, DevTools opening will trigger these o-i-c requests.
  // We will just ignore them to avoid showing errors in console.
  if (
    event.request.cache === 'only-if-cached' &&
    event.request.mode !== 'same-origin'
  ) {
    return;
  }

  // Don't cache anything that isn't a GET request
  if (event.request.method !== 'GET') {
    return event.respondWith(fetch(event.request));
  }

  const match = event.request.url.match(/\/api\/([a-z]+)\/?(.*)/);

  if (!match) {
    return event.respondWith(fetch(event.request));
  }

  const [, entity, id] = match;

  return event.respondWith(getResponse(event.request, entity as Entity, id));
});
