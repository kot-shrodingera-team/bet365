class Request {
  subscribes: Record<string, Array<Function>>;

  constructor() {
    this.subscribes = {};
  }

  subscribe(url: string, callback: Function): void {
    if (!this.subscribes[url]) {
      this.subscribes[url] = [];
    }
    if (worker.Api.Request.AddRequestResponseHandler(url)) {
      this.subscribes[url].push(callback);
    } else {
      console.error('Ошибка подписки');
    }
  }

  onResponse(
    url: string,
    data: Record<string, unknown>,
    method: string,
    fullUrl: string
  ): void {
    if (this.subscribes[url]) {
      this.subscribes[url].forEach((callback) =>
        callback(url, data, method, fullUrl)
      );
    } else {
      console.warn(`Нет подписчиков для ${url}`);
    }
  }

  clearAllRequestResponseSubscribes(): void {
    this.subscribes = {};
    worker.Api.Request.ClearAllRequestResponseSubscribes();
  }
}

export default Request;
