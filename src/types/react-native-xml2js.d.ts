declare module 'react-native-xml2js' {
  export function parseString(
    xml: string,
    callback: (err: Error | null, result: any) => void,
  ): void;
}
