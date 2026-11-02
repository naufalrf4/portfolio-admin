declare module 'dom-to-image-more' {
  export function toBlob(
    node: HTMLElement,
    options?: {
      width?: number;
      height?: number;
      style?: Record<string, string>;
      quality?: number;
      bgcolor?: string;
    }
  ): Promise<Blob>;

  export function toPng(
    node: HTMLElement,
    options?: {
      width?: number;
      height?: number;
      style?: Record<string, string>;
      quality?: number;
      bgcolor?: string;
    }
  ): Promise<string>;
}
