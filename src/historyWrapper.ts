export default function createWrappedHistory(historyFactory: any, router: any) {
  const history = createHistory(historyFactory);
  routingInterceptor(history, router);
  return history;
}

export function createHistory(historyFactory: any) {
  return historyFactory({
    getUserConfirmation: (message: string, cb: (t: boolean) => void) => {
      // Block all routing from react-router which makes it this far.
      // routingInterceptor takes care of actually deciding
      // if routing is allowed.
      cb(false);
    },
  });
}

/* Intercepts routing calls and uses the native app communicator to perform routing instead */
export function routingInterceptor(history: any, router: any) {
  history.block((location: any, action: string) => {
    if (router.triggeredRouting || action === 'POP') {
      // Action === POP is true when developing IWAs on desktop and the
      // browser forward and back buttons are used.
      // Set to false as they should only trigger once.
      router.triggeredRouting = false;
      return;
    }
    // router can trigger a new navigation event as part of the navigate call, which is not
    // handled correctly if history.block has not returned yet, this delay ensures that
    // history.block returns correctly before the next navigation event is fired.
    setTimeout(() => {
      router.navigate(location.pathname, action === 'REPLACE');
    }, 50);
    // Block expects a string to be returned to display to the user.
    // We do not actually display this though, we always block navigation.
    return 'Blocked navigation';
  });
}
