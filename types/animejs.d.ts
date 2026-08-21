// ponytail: minimal animejs v3 surface used by the app
declare module "animejs" {
  interface AnimeParams {
    targets?: unknown;
    duration?: number | number[];
    delay?: number | number[] | ((el: unknown, i: number, total: number) => number);
    easing?: string | ((el: unknown, i: number, total: number) => (t: number) => number);
    [key: string]: unknown;
  }
  interface AnimeInstance {
    pause?: () => void;
    play?: () => void;
    restart?: () => void;
  }
  type StaggerFn = (el: unknown, i: number, total: number) => number;
  type AnimeCallable = {
    (params: AnimeParams): AnimeInstance;
    timeline?: (params?: AnimeParams) => AnimeInstance;
    set?: (targets: unknown, params: AnimeParams) => void;
    remove?: (targets: unknown) => void;
    stagger?: (value: number, options?: object) => StaggerFn;
  };
  const anime: AnimeCallable;
  export default anime;
}
