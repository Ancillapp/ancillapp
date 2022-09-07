import { initDB } from './utils';

type Entity = 'songs' | 'prayers' | 'ancillas';

export interface APIResponse<T> {
  loading: boolean;
  refreshing: boolean;
  data?: T;
  error?: Error;
}

const supportedEntities: Entity[] = ['songs', 'prayers', 'ancillas'];

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateLocalDBSummaryData = async <T extends any[]>(
  request: RequestInfo,
  entity: Entity,
  cachedData: T,
): Promise<T> => {
  const db = await dbPromise;

  const idField = entityToIdFieldMap[entity];

  const response = await fetch(request);

  const parsedResponse: T = await response.json();

  const newData = parsedResponse.map((data) => {
    const oldData = cachedData.find(
      ({ [idField]: id }) => id === data[idField],
    );

    return { ...oldData, ...data };
  }) as T;

  const deletedData = cachedData.filter((data) =>
    newData.every(({ [idField]: id }) => id !== data[idField]),
  );

  const transaction = db.transaction(entity, 'readwrite');

  const objectStore = transaction.objectStore(entity);

  newData.forEach((data) => objectStore.put(data));
  deletedData.forEach(({ id }) => objectStore.delete(id));

  await transaction.done;

  return newData;
};

const updateLocalDBDetailData = async <T extends Record<string, unknown>>(
  request: RequestInfo,
  entity: Entity,
  cachedData?: T,
): Promise<T> => {
  const db = await dbPromise;

  const response = await fetch(request);

  const parsedResponse = await response.json();

  const newData = {
    ...cachedData,
    ...parsedResponse,
  };

  await db.put(entity, newData);

  return newData;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatCachedResponse = <T extends any[]>(
  entity: Entity,
  cachedData: T,
) => {
  if (entity === 'songs') {
    return cachedData.sort(
      ({ number: a }: T[number], { number: b }: T[number]) => {
        const normalizedA = a.replace('bis', '').padStart(4, 0);
        const normalizedB = b.replace('bis', '').padStart(4, 0);

        if (normalizedA === normalizedB) {
          return b.endsWith('bis') ? -1 : 1;
        }

        return normalizedA < normalizedB ? -1 : 1;
      },
    );
  }

  return cachedData;
};

export async function* cacheAndNetwork<T>(
  requestInfo: RequestInfo | Promise<RequestInfo>,
): AsyncGenerator<APIResponse<T>> {
  try {
    yield { loading: true, refreshing: false };

    const [db, request] = await Promise.all([dbPromise, requestInfo]);

    const match = (typeof request === 'string' ? request : request.url).match(
      /\/api\/([a-z]+)[/?]?(.*)/,
    );

    if (!match) {
      throw new Error('Only API requests are supported');
    }

    const [, entity, id] = match as [unknown, Entity, string | undefined];

    if (!supportedEntities.includes(entity as Entity)) {
      throw new Error('Unsupported API endpoint');
    }

    if (!id || id === 'fullData') {
      const cachedData = await db.getAll(entity);

      const localDBSummaryDataUpdatePromise = updateLocalDBSummaryData(
        request,
        entity,
        cachedData,
      );

      if (cachedData.length > 0) {
        yield {
          loading: false,
          refreshing: true,
          data: formatCachedResponse(entity, cachedData) as unknown as T,
        };
      }

      try {
        const data = (await localDBSummaryDataUpdatePromise) as unknown as T;

        yield {
          loading: false,
          refreshing: false,
          data,
        };
      } catch (fetchError) {
        yield {
          loading: false,
          refreshing: false,
          error: fetchError as TypeError,
          ...(cachedData.length > 0 && {
            data: formatCachedResponse(entity, cachedData) as unknown as T,
          }),
        };
      }

      return;
    }

    const cachedData = await db.get(entity, id);

    const localDBDetailDataUpdatePromise = updateLocalDBDetailData(
      request,
      entity,
      cachedData,
    );

    if (
      cachedData &&
      (!entityToDetailFieldMap[entity] ||
        entityToDetailFieldMap[entity]! in cachedData)
    ) {
      yield {
        loading: false,
        refreshing: true,
        data: cachedData as unknown as T,
      };
    }

    try {
      const data = (await localDBDetailDataUpdatePromise) as unknown as T;

      yield {
        loading: false,
        refreshing: false,
        data,
      };
    } catch (fetchError) {
      yield {
        loading: false,
        refreshing: false,
        error: fetchError as TypeError,
        ...(cachedData &&
          (!entityToDetailFieldMap[entity] ||
            entityToDetailFieldMap[entity]! in cachedData) && {
            data: cachedData as unknown as T,
          }),
      };
    }
  } catch (error) {
    yield {
      loading: false,
      refreshing: false,
      error: error as Error,
    };
  }
}
