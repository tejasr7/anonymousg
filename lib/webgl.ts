"use client";

// ponytail: detect WebGL once on mount; SSR returns false.

import { useEffect, useState } from "react";

export function useWebGLAvailable(): boolean {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setAvailable(!!gl);
    } catch {
      setAvailable(false);
    }
  }, []);
  return available;
}
