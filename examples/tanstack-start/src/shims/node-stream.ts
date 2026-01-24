export class Readable {
  static from(): never {
    throw new Error('Readable streams are not available in the browser.');
  }
}
