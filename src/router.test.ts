import Router from './router';

const comm = {
  messageReceived: {
    on: () => {},
  },
};

describe('Router', () => {
  describe('resolve', () => {
    it('Should return the same path when the target app is not registered', () => {
      const router = new Router(comm as any, null as any);
      expect(router.resolve('/', 'home')).toBe('/');
    });

    it('Should prepend base path for registered applications', () => {
      const router = new Router(comm as any, null as any);
      router.registerApplication('home', '/home');
      expect(router.resolve('/', 'home')).toBe('/home');
    });

    it('Should normalise paths when joining', () => {
      const router = new Router(comm as any, null as any);
      router.registerApplication('home', '/');
      expect(router.resolve('/', 'home')).toBe('/');
      expect(router.resolve('', 'home')).toBe('/');
      expect(router.resolve('/test/', 'home')).toBe('/test');
      expect(router.resolve('//test//another////', 'home')).toBe('/test/another');
    });
  });
});
