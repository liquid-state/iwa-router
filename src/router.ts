import { Communicator } from '@liquid-state/iwa-core';
import { navigate, back, setBackOverride } from './messages';
import { stringify } from './querystring';

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
  private history: any | undefined = undefined;
  private registeredApps = new Map<string, string>();

  public triggeredRouting = false;

  public context: object;
  public extraData: object;

  constructor(private communicator: Communicator.ICommunicator) {
    communicator.messageReceived.on(message => {
      if (message.purpose === 'navigate') {
        this.handleNavigation(message as NavigateMessage);
      } else if (message.purpose === 'back_triggered' && this.backCallback) {
        this.backCallback();
      }
    });
  }

  setHistory(history: any) {
    this.history = history;
  }

  registerApplication(id: string, baseRoute: string) {
    this.registeredApps.set(id, baseRoute);
  }

  navigate(path: string, replace?: boolean, additionalData?: object) {
    let iwa: string | null = null;
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
    this.triggeredRouting = true;

    this.context = message.context || {};
    this.extraData = message.params || {};

    const location = {
      pathname: message.route,
      search: stringify(message.params || {}),
    };
    if (!this.history) {
      throw `Tried to navigate to ${location} but was unable to do so as history is not setup. Make sure you called router.setHistory(history)`;
    }
    const method = message.action === 'replace' ? this.history.replace : this.history.push;
    method(location);
  }
}
