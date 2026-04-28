declare module 'react-native-bcrypt' {
  function genSalt(rounds: number, callback: (err: Error | null, salt: string) => void): void;
  function hash(data: string, salt: string, callback: (err: Error | null, hash: string) => void): void;
  function compare(data: string, hash: string, callback: (err: Error | null, match: boolean) => void): void;
}
