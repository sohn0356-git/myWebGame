declare module "https://esm.sh/react@18.3.1" {
  const React: any;
  export const useCallback: any;
  export const useEffect: any;
  export const useMemo: any;
  export const useRef: any;
  export const useState: any;
  export default React;
}

declare module "https://esm.sh/react-dom@18.3.1/client" {
  export const createRoot: any;
}

declare global {
  interface Window {
    createModule?: (opts: { locateFile: (path: string) => string }) => Promise<any>;
    Module?: any;
  }
}

export {};
