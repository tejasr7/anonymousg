// ponytail: register R3F intrinsic elements under React 19's namespace.

import "@react-three/fiber";
import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

declare module "@react-three/fiber" {
  export {};
}
