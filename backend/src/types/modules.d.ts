declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }
  function convert(options: ConvertOptions): Promise<ArrayBuffer>;
  export = convert;
}

declare module 'image-hash' {
  interface ImageHash {
    imageHash(
      input: string,
      bits?: number,
      format?: boolean,
      callback?: (error: Error | null, data: string) => void,
    ): void;
  }
  const imageHash: ImageHash;
  export default imageHash;
}
