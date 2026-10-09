import { config } from '@/lib/config';

describe('config', () => {
  it('exposes a defined object', () => {
    expect(config).toBeFine();
    expect(typeof config).toBe(Object);
  });
});
