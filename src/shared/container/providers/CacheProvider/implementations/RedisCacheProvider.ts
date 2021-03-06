import Redis, { Redis as RedisClient } from 'ioredis';
import cacheConfig from '@config/cache';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

export default class RedisCacheProvider implements ICacheProvider {
  /** Cria client do tipo Redis */
  private client: RedisClient;

  constructor() {
    /** Define valor de client como novo redis */
    this.client = new Redis(cacheConfig.config.redis);
  }

  public async save(key: string, value: string): Promise<void> {
    /** Salva par key, value no banco redis */
    await this.client.set(key, JSON.stringify(value));
  }

  public async recover<T>(key: string): Promise<T | null> {
    /** Busca valor no cach atraves da chave */
    const data = await this.client.get(key);

    /** Se nao encontrou data, retorna nulo */
    if (!data) {
      return null;
    }

    /** Converte string no tipo T */
    const parsedData = JSON.parse(data) as T;

    /** Retorna dado convertido */
    return parsedData;
  }

  public async invalidate(key: string): Promise<void> {
    /** Deleta chave do banco de dados */
    await this.client.del(key);
  }

  public async invalidatePrefix(prefix: string): Promise<void> {
    /** Encontra chaves com determinado prefixo */
    const keys = await this.client.keys(`${prefix}:*`);

    /** Cria pipeline, mais performatico para executar multiplas operacoes ao mesmo tempo */
    const pipeline = this.client.pipeline();

    /** Deleta itens listado nas chaves */
    keys.forEach(key => {
      pipeline.del(key);
    });

    /** Executa pipeline */
    await pipeline.exec();
  }
}
