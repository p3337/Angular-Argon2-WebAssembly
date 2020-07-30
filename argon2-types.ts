// export function hash(
//   options: Argon2BrowserHashOptions,
// ): Promise<Argon2BrowserHashResult>;

// export function unloadRuntime(): void;

export interface Argon2BrowserHashOptions {
  pass: string;
  salt: string;
  time?: number;
  mem?: number;
  hashLen?: number;
  parallelism?: number;
  type?: ArgonType;
  distPath?: string;
}

export interface Argon2BrowserHashResult {
  encoded: string;
  hash: Uint8Array;
  hashHex: string;
}

// Argon2Error provided on promise rejection
// export function verify(options: Argon2VerifyOptions): Promise<undefined>;

export interface Argon2VerifyOptions {
  pass: string;
  encoded: string | Uint8Array;
  type?: ArgonType;
}

export interface Argon2Error {
  message: string;
  code: number;
}

export enum ArgonType {
  Argon2d = 0,
  Argon2i = 1,
  Argon2id = 2,
}


declare namespace Emscripten {
  export type EnvironmentType = 'WEB' | 'NODE' | 'SHELL' | 'WORKER';
  export type CIntType = 'i8' | 'i16' | 'i32' | 'i64';
  export type CFloatType = 'float' | 'double';
  export type CPointerType =
    | 'i8*'
    | 'i16*'
    | 'i32*'
    | 'i64*'
    | 'float*'
    | 'double*'
    | '*';
    export type CType = CIntType | CFloatType | CPointerType;
    export type WebAssemblyImports = Array<{
    name: string;
    kind: string;
  }>;

  export type WebAssemblyExports = Array<{
    module: string;
    name: string;
    kind: string;
  }>;
}

export interface EmscriptenModule {
  print?(str: string): void;
  printErr?(str: string): void;
  arguments?: string[];
  environment?: Emscripten.EnvironmentType;
  preInit?: Array<{ (): void }>;
  preRun?: Array<{ (): void }>;
  postRun?: Array<{ (): void }>;
  onAbort?: { (what: any): void };
  onRuntimeInitialized?: { (): void };
  preinitializedWebGLContext?: WebGLRenderingContext;
  noInitialRun?: boolean;
  noExitRuntime?: boolean;
  logReadFiles?: boolean;
  filePackagePrefixURL?: string;
  wasmBinary: ArrayBuffer;
  wasmMemory: WebAssembly.Memory;

  destroy?(object: object): void;
  getPreloadedPackage?(
    remotePackageName: string,
    remotePackageSize: number
  ): ArrayBuffer;
  instantiateWasm?(
    imports: Emscripten.WebAssemblyImports,
    successCallback: (module: WebAssembly.Module) => void
  ): Emscripten.WebAssemblyExports;
  locateFile?(url: string, scriptDirectory: string): string;
  onCustomMessage?(event: MessageEvent): void;

  // USE_TYPED_ARRAYS == 1
  HEAP?: Int32Array;
  IHEAP?: Int32Array;
  FHEAP?: Float64Array;

  // USE_TYPED_ARRAYS == 2
  HEAP8?: Int8Array;
  HEAP16?: Int16Array;
  HEAP32?: Int32Array;
  HEAPU8?: Uint8Array;
  HEAPU16?: Uint16Array;
  HEAPU32?: Uint32Array;
  HEAPF32?: Float32Array;
  HEAPF64?: Float64Array;

  TOTAL_STACK?: number;
  TOTAL_MEMORY?: number;
  FAST_MEMORY?: number;
  ALLOC_NORMAL?: number;

  addOnPreRun?(cb: () => any): void;
  addOnInit?(cb: () => any): void;
  addOnPreMain?(cb: () => any): void;
  addOnExit?(cb: () => any): void;
  addOnPostRun?(cb: () => any): void;

  UTF8ToString?(ptr: number, maxBytesToRead?: number): string;

  _argon2_hash?(
    t_cost: number,
    m_cost: number,
    parallelism: number,
    pwd: number,
    pwdlen: number,
    salt: number,
    saltlen: number,
    hash: number,
    hashlen: number,
    encoded: number,
    encodedlen: number,
    type: ArgonType,
    version: number
  ): number;
  _argon2_error_message?(error_code: number): number;

  preloadedImages?: any;
  preloadedAudios?: any;

  _malloc?(size: number): number;
  _free?(ptr: number): void;
  allocate?(
    slab: number[] | ArrayBufferView | number,
    types: Emscripten.CType | Emscripten.CType[],
    allocator: number,
    ptr?: number
  ): number;
}
