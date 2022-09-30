import { init as initDB } from './database';
import { AncillappDataDBSchema } from './database';

type Entity = keyof Pick<
  AncillappDataDBSchema,
  'songs' | 'prayers' | 'magazines'
>;

export interface APIResponse<T> {
  loading: boolean;
  refreshing: boolean;
  data?: T;
  error?: Error;
}

const supportedEntities: Entity[] = ['songs', 'prayers', 'magazines'];

const entityToIdFieldsMap: {
  [key in Entity]: (keyof AncillappDataDBSchema[key]['value'])[];
} = {
  songs: ['language', 'category', 'number'],
  prayers: ['slug'],
  magazines: ['type', 'code'],
};

const entityToDetailFieldMap: {
  [key in Entity]?: keyof AncillappDataDBSchema[key]['value'];
} = {
  songs: 'content',
  prayers: 'content',
};

const dbPromise = initDB();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateLocalDBSummaryData = async <
  T extends Entity,
  U extends AncillappDataDBSchema[T]['value'][],
>(
  request: RequestInfo,
  entity: T,
  cachedData: U,
): Promise<U> => {
  const db = await dbPromise;

  const idFields = entityToIdFieldsMap[entity];

  const response = await fetch(request);

  const parsedResponse: U = await response.json();

  const newData = parsedResponse.map((data) => {
    const oldData = cachedData.find((item) =>
      idFields.every((idField) => item[idField] === data[idField]),
    );

    return { ...oldData, ...data };
  }) as U;

  const deletedData = cachedData.filter((data) =>
    newData.every(
      (item) => !idFields.every((idField) => item[idField] === data[idField]),
    ),
  ) as U;

  const transaction = db.transaction(entity, 'readwrite');

  const objectStore = transaction.objectStore(entity);

  newData.forEach((data) => objectStore.put(data));
  deletedData.forEach((data) =>
    objectStore.delete(
      idFields.map(
        (idField) => data[idField],
      ) as unknown as AncillappDataDBSchema[T]['key'],
    ),
  );

  await transaction.done;

  return newData;
};

const updateLocalDBDetailData = async <T>(
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
          data: cachedData as T,
        };
      }

      try {
        const data = (await localDBSummaryDataUpdatePromise) as T;

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
            data: cachedData as T,
          }),
        };
      }

      return;
    }

    const normalizedId = (
      id.includes('/') ? id.split('/') : id
    ) as AncillappDataDBSchema[Entity]['key'];

    const cachedData = await db.get(entity, normalizedId);

    const localDBDetailDataUpdatePromise = updateLocalDBDetailData(
      request,
      entity,
      cachedData,
    );

    if (
      cachedData &&
      (!entityToDetailFieldMap[entity] ||
        !cachedData?.[
          entityToDetailFieldMap[entity] as keyof typeof cachedData
        ])
    ) {
      yield {
        loading: false,
        refreshing: true,
        data: cachedData as T,
      };
    }

    try {
      const data = (await localDBDetailDataUpdatePromise) as T;

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
        data: cachedData as T,
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
