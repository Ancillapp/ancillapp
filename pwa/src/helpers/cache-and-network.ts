import { db } from './database';
import {
  AncillappDataDBSchema,
  ProxyDBBatchOperation,
  ProxyObjectStore,
} from '../service-worker/database';

type Entity = keyof Pick<
  AncillappDataDBSchema,
  'songs' | 'prayers' | 'ancillas'
>;

export interface APIResponse<T> {
  loading: boolean;
  refreshing: boolean;
  data?: T;
  error?: Error;
}

const supportedEntities: Entity[] = ['songs', 'prayers', 'ancillas'];

const entityToIdFieldsMap: {
  [key in Entity]: (keyof AncillappDataDBSchema[key]['value'])[];
} = {
  songs: ['language', 'category', 'number'],
  prayers: ['slug'],
  ancillas: ['code'],
};

const entityToDetailFieldMap: {
  [key in Entity]?: keyof AncillappDataDBSchema[key]['value'];
} = {
  songs: 'content',
  prayers: 'content',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateLocalDBSummaryData = async <
  T extends Entity,
  U extends AncillappDataDBSchema[T]['value'][],
>(
  request: RequestInfo,
  entity: T,
  cachedData: U,
): Promise<U> => {
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

  db.batch(entity, 'readwrite', { durability: 'strict' }, [
    ...newData.map<ProxyDBBatchOperation<keyof ProxyObjectStore>>((data) => ({
      objectStore: entity,
      method: 'put',
      args: [data],
    })),
    ...deletedData.map<ProxyDBBatchOperation<keyof ProxyObjectStore>>(
      (item) => ({
        objectStore: entity,
        method: 'delete',
        args: [
          idFields.map((idField) => item[idField]) as unknown as Parameters<
            ProxyObjectStore['delete']
          >[0],
        ],
      }),
    ),
  ]);

  return newData;
};

const updateLocalDBDetailData = async <T extends Record<string, unknown>>(
  request: RequestInfo,
  entity: Entity,
  cachedData?: T,
): Promise<T> => {
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

    const request = await requestInfo;

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

    const normalizedId = (id.includes('/') ? id.split('/') : id) as
      | string
      | [string, string, string];

    const cachedData = await db.get(entity, normalizedId);

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
