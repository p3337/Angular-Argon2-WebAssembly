import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ArgonType,
  Argon2BrowserHashOptions,
  Argon2BrowserHashResult,
  Argon2Error,
  EmscriptenModule,
} from './argon2-types';

import * as Argon2Module from './argon2.js';
import { wasmBinaryBase64 } from './argon2';

@Injectable({
  providedIn: 'root',
})
export class Argon2Service {
  private argon2Iterations: number = 300;
  private argon2Memory: number = 1 << 10;
  private argon2Parallelism: number = 1;
  private argon2HashLen: number = 64;

  constructor() {
    if (!WebAssembly) {
      throw new Error('WebAssembly not supported here.');
    }
  }

  private initWasm(mem: number): Promise<EmscriptenModule> {
    const moduleArgs: EmscriptenModule = {
      wasmBinary: this.decodeWasmBinary(wasmBinaryBase64),
      wasmMemory: mem ? this.createWasmMemory(mem) : undefined,
    };
    return Argon2Module(moduleArgs);
  }

  private decodeWasmBinary(base64): Uint8Array {
    const text: string = atob(base64);
    const binary: Uint8Array = new Uint8Array(new ArrayBuffer(text.length));
    for (let i = 0; i < text.length; i++) {
      binary[i] = text.charCodeAt(i);
    }
    return binary;
  }

  private createWasmMemory(mem): WebAssembly.Memory {
    const KB: number = 1024 * 1024;
    const MB: number = 1024 * KB;
    const GB: number = 1024 * MB;
    const WASM_PAGE_SIZE: number = 64 * 1024;

    const totalMemory: number = (2 * GB - 64 * KB) / 1024 / WASM_PAGE_SIZE;
    const initialMemory: number = Math.min(
      Math.max(Math.ceil((mem * 1024) / WASM_PAGE_SIZE), 256) + 256,
      totalMemory
    );

    return new WebAssembly.Memory({
      initial: initialMemory,
      maximum: totalMemory,
    });
  }

  private allocateArray(Module, arr): number {
    const nullTerminatedArray = new Uint8Array([...arr, 0]);
    return Module.allocate(nullTerminatedArray, 'i8', Module.ALLOC_NORMAL);
  }

  private encodeUtf8(str: string): Uint8Array {
    if (typeof TextEncoder === 'function') {
      return new TextEncoder().encode(str);
    } else {
      throw new Error("Don't know how to encode UTF8");
    }
  }

  /**
   * Argon2 hash
   * @param {string} params.pass - password string
   * @param {string} params.salt - salt string
   * @param {number} [params.time=300] - the number of iterations
   * @param {number} [params.mem=1024] - used memory, in KiB
   * @param {number} [params.hashLen=64] - desired hash length
   * @param {number} [params.parallelism=1] - desired parallelism
   * @param {number} [params.type=argon2.ArgonType.Argon2i] - hash type:
   *      argon2.ArgonType.Argon2d
   *      argon2.ArgonType.Argon2i
   *      argon2.ArgonType.Argon2id
   *
   * @return Promise<Argon2BrowserHashResult>
   */
  public argon2Hash(
    params: Argon2BrowserHashOptions
  ): Observable<Argon2BrowserHashResult> {
    const mCost = params.mem || this.argon2Memory;
    return from(this.initWasm(mCost)).pipe(
      map((argon2Module: EmscriptenModule) => {
        const tCost: number = params.time || this.argon2Iterations;
        const parallelism: number =
          params.parallelism || this.argon2Parallelism;
        const pwdEncoded: Uint8Array = this.encodeUtf8(params.pass);
        const pwd: number = this.allocateArray(argon2Module, pwdEncoded);
        const pwdlen: number = pwdEncoded.length;
        const saltEncoded: Uint8Array = this.encodeUtf8(params.salt);
        const salt: number = this.allocateArray(argon2Module, saltEncoded);
        const saltlen: number = saltEncoded.length;
        const hash: number = argon2Module.allocate(
          new Array(params.hashLen || this.argon2HashLen),
          'i8',
          argon2Module.ALLOC_NORMAL
        );
        const hashlen: number = params.hashLen || this.argon2HashLen;
        const encoded: number = argon2Module.allocate(
          new Array(512),
          'i8',
          argon2Module.ALLOC_NORMAL
        );
        const encodedlen: number = 512;
        const argon2Type: ArgonType = params.type || ArgonType.Argon2i;
        const version = 0x13;
        let err;
        let res;
        try {
          res = argon2Module._argon2_hash(
            tCost,
            mCost,
            parallelism,
            pwd,
            pwdlen,
            salt,
            saltlen,
            hash,
            hashlen,
            encoded,
            encodedlen,
            argon2Type,
            version
          );
        } catch (e) {
          err = e;
        }

        let result: Argon2BrowserHashResult = {} as Argon2BrowserHashResult;
        let error: Argon2Error = { message: '', code: 0 } as Argon2Error;

        if (res === 0 && !err) {
          let hashStr = '';
          const hashArr = new Uint8Array(hashlen);
          for (let i = 0; i < hashlen; i++) {
            const byte = argon2Module.HEAP8[hash + i];
            hashArr[i] = byte;
            hashStr += ('0' + (0xff & byte).toString(16)).slice(-2);
          }
          const encodedStr = argon2Module.UTF8ToString(encoded);
          result = {
            hash: hashArr,
            hashHex: hashStr,
            encoded: encodedStr,
          };
        } else {
          try {
            if (!err) {
              err = argon2Module.UTF8ToString(
                argon2Module._argon2_error_message(res)
              );
            }
          } catch (e) {}
          error = { message: err, code: res };
        }
        try {
          argon2Module._free(pwd);
          argon2Module._free(salt);
          argon2Module._free(hash);
          argon2Module._free(encoded);
        } catch (e) {}
        if (err) {
          throw error;
        } else {
          return result;
        }
      })
    );
  }
}
