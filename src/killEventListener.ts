const killEventListener = (eventType: string): void => {
  window.addEventListener(
    eventType,
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    {
      capture: true,
      passive: false,
    }
  );
};

export default killEventListener;
