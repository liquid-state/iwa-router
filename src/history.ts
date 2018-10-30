import { Router } from ".";

export interface Location {
  pathname: string,
}

export interface IHistory {
  length: number,
  action: "POP" | "REPLACE" | "PUSH",
  location: Location,
  push(path: string): void,
  replace(path: string): void,
  go(n: number): void,
  goBack(): void,
  goForward(): void,
  listen(cb: (location: Location, action: string) => void): () => void
}

export default ({ baseHistory, router }: { baseHistory: IHistory, router: Router }): IHistory => {

  baseHistory.listen(() => {
    history.length = baseHistory.length;
    history.action = baseHistory.action;
    history.location = baseHistory.location;
  });

  const push = (path: string) => {
    router.navigate(path);
  }

  const replace = (path: string) => {
    router.navigate(path, true);
  }

  const go = (n: number) => {
    if (n !== -1) {
      throw new Error('Using history based navigation to go back or forward and number other '
        + 'than -1 is not supported. Please use router.back directly.');
    }
    router.back();
  }

  const goBack = () => go(-1);
  const goForward = () => go(1);

  const history = {
    ...baseHistory,
    push,
    replace,
    go,
    goBack,
    goForward,
  };

  return history;
}