declare module 'vertica-nodejs' {
  import { EventEmitter } from 'events';

  export interface ConnectionConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    connectionTimeoutMillis?: number;
    ssl?: boolean | object;
  }

  export interface QueryResult {
    rows: any[];
    fields: any[];
    command: string;
    rowCount: number;
    oid: number;
  }

  export interface QueryConfig {
    name?: string;
    text: string;
    values?: any[];
  }

  export declare class Client extends EventEmitter {
    constructor(config?: ConnectionConfig | string);
    connect(): Promise<void>;
    connect(callback: (err?: Error) => void): void;
    end(): Promise<void>;
    end(callback: (err?: Error) => void): void;
    query(text: string): Promise<QueryResult>;
    query(text: string, values: any[]): Promise<QueryResult>;
    query(text: string, callback: (err: Error, result: QueryResult) => void): void;
    query(text: string, values: any[], callback: (err: Error, result: QueryResult) => void): void;
    query(config: QueryConfig): Promise<QueryResult>;
    query(config: QueryConfig, callback: (err: Error, result: QueryResult) => void): void;
  }

  export interface VerticaStatic {
    Client: typeof Client;
    Pool: any;
    defaults: any;
    types: any;
    DatabaseError: any;
    version: string;
  }

  const vertica: VerticaStatic;
  export = vertica;
}