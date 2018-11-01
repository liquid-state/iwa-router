import { ICommunicator } from '@liquid-state/iwa-core/dist/communicator';
import { Messages } from '@liquid-state/iwa-core';
import { IHistory } from './history';

interface NavigateMessage {
  purpose: string;
  action: string;
  route: string;
  params: object;
  context: object;
  [key: string]: any;
}

export type NavigateOptions = {
  app?: string;
  tab?: string;
  replace?: boolean;
  additionalData?: object;
};

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

  /** Registers an application so that its routes can be remapped using resolve
   *
   * @see Router#resolve
   */
  registerApplication(applicationId: string, baseRoute: string) {
    this.registeredApps.set(applicationId, baseRoute);
  }

  /** Resolves an IWA local path into an application global path
   *
   * When building desktop applications which utilise multiple independent web apps
   * it becomes necessary to deal with route collisions.
   * eg. Webapp A and Webapp B both use / as their entrypoint routes.
   * This method takes a path and an IWA id and returns a mapped route based on the
   * applications registered with this router using the registerApplication method.
   *
   */
  resolve(path: string, applicationId: string) {
    path = this.normalise(path);
    const basePath = this.registeredApps.get(applicationId);
    return basePath !== undefined ? this.normalise(`${basePath}${path}`) : path;
  }

  navigate(path: string, options?: NavigateOptions) {
    path = this.normalise(path);
    this.communicator.send(Messages.iwa.navigate(path, options));
  }

  private normalise(path: string) {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    while (path.includes('//')) {
      path = path.replace(/\/\//g, '/');
    }
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, path.length - 2);
    }
    return path;
  }

  back(options?: BackOptions) {
    const { navigateBack } = Messages.iwa;
    const message = options ? navigateBack(options.route, options.iwa) : navigateBack();
    this.communicator.send(message);
  }

  setBackOverride(callback: () => void) {
    this.backCallback = callback;
    this.communicator.send(Messages.app.setBackOverride(true));
  }

  clearBackOverride(): void {
    this.backCallback = undefined;
    this.communicator.send(Messages.app.setBackOverride(false));
  }

  private handleNavigation(message: NavigateMessage) {
    this.backCallback = undefined;

    this.context = message.context || {};
    this.extraData = message.params || {};

    if (message.__internal && message.__internal.isFromBack) {
      /* This message was created by the desktop app during a navigateBack event
        * Per the spec, when a navigateBack is recieved:
        *   the stack should be restored to the last instance of that route
        *   the original navigate message should be redelivered
        * 
        * this allows context and extraData to be set correctly, and the app to respond to the
        * route being rendered regardless of whether it results from a navigate or navigateBack.
        * 
        * Because of limitations of the desktop browser, we cannot perfectly replicate this
        * behaviour and so instead we implement the following:
        *   The navigation middleware winds the stack back correctly
        *   The navigation middleware dispatches the original navigation action for the new route
        *   but with this additional flag added so that the router does not attempt to
        *   manipulate the navigation stack.
      */
      return;
    }

    const method = message.action === 'replace' ? this.history.replace : this.history.push;
    method(message.route);
  }
}
