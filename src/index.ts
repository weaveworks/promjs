import { Registry } from './registry';

export * from './registry';
export * from './collector';
export * from './counter';
export * from './gauge';
export * from './histogram';

export default () => new Registry();
