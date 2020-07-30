# Angular Argon2 WebAssembly



## Usage

```

import { Argon2Service } from './argon2.service';
import { Argon2BrowserHashOptions, Argon2BrowserHashResult } from './argon2-types';

# ...

export class AuthService {

  constructor(private argon2Service: Argon2Service) {}

  # ...

   public generateHash(email: string, password: string): Observable<Argon2BrowserHashResult>
   {
      let argon2Options: Argon2BrowserHashOptions = {
         pass: password,
         salt: salt,
      };
      return this.argon2Service.argon2Hash(argon2Options)
   }

   # ...
}
```

## Building

Prerequisites:

- latest emscripten with WebAssembly support ([howto](http://webassembly.org/getting-started/developers-guide/))
- CMake

Run:
```
bash build.sh
```
