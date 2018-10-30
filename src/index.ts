import * as messages from './messages';
import * as querystring from './querystring';
import Router from './router';
import createIwaHistory, { IHistory, Location } from './history';

export { messages, querystring, createIwaHistory, Router };

const initialise = (app: any, historyFactory: any) => {
  const baseHistory = historyFactory();
  const router = new Router(app.communicator, baseHistory);
  const history = createIwaHistory({ baseHistory, router });
  return {
    router,
    history,
  };
};

export default initialise;
