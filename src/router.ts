import { ICommunicator } from '@liquid-state/iwa-core/dist/communicator';
import { navigate, back, setBackOverride } from './messages';
import { IHistory } from './history';

interface NavigateMessage {
  purpose: string;
  action: string;
  route: string;
  params: object;
  context: object;
}

export interface BackOptions {
  route: string;
  iwa?: string;
}

export default class Router {
  private backCallback: (() => void) | undefined = undefined;
  private registeredApps = new Map<string, string>();

  public context: object;
  public extraData: object;

  constructor(private communicator: ICommunicator, private history: IHistory) {
    communicator.messageReceived.on(message => {
      if (message.purpose === 'navigate') {
        this.handleNavigation(message as NavigateMessage);
      } else if (message.purpose === 'back_triggered' && this.backCallback) {
        this.backCallback();
      }
    });
  }

  registerApplication(id: string, baseRoute: string) {
    this.registeredApps.set(id, baseRoute);
  }

  navigate(path: string, replace?: boolean, additionalData?: object) {
    let iwa: string | undefined = undefined;
    if (path.indexOf('external://') !== -1) {
      // Strip the scheme.
      path = path.substr(path.indexOf('//') + 2);
      let pathIndex = path.indexOf('/');

      iwa = path.substr(0, pathIndex);
      path = path.substr(pathIndex);
    }
    this.communicator.send(navigate(path, iwa, replace, additionalData));
  }

  back(options?: BackOptions) {
    const message = options ? back(options.route, options.iwa) : back();
    this.communicator.send(message);
  }

  setBackOverride(callback: () => void) {
    this.backCallback = callback;
    this.communicator.send(setBackOverride(true));
  }

  clearBackOverride(): void {
    this.backCallback = undefined;
    this.communicator.send(setBackOverride(false));
  }

  resolve(path: string, iwa?: string) {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    if (iwa) {
      let basePath = this.registeredApps.get(iwa);
      return basePath !== undefined ? `${basePath}${path}` : `/external://${iwa}${path}`;
    }
    return path;
  }

  private handleNavigation(message: NavigateMessage) {
    this.backCallback = undefined;

    this.context = message.context || {};
    this.extraData = message.params || {};

    const method = message.action === 'replace' ? this.history.replace : this.history.push;
    method(message.route);
  }
}
