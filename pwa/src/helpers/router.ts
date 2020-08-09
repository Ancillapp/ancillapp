export type LocationUpdatedCallback = (
  location: Location,
  event: Event | null,
) => void;

const callbacks: LocationUpdatedCallback[] = [];

/**
  Basic router that calls a callback whenever the location is updated.
  Example:
      import { installRouter } from 'pwa-helpers/router.js';
      installRouter((location) => handleNavigation(location));
  For example, if you're using this router in a Redux-connected component,
  you could dispatch an action in the callback:
      import { installRouter } from 'pwa-helpers/router.js';
      import { navigate } from '../actions/app.js';
      installRouter((location) => store.dispatch(navigate(location)))
  If you need to force a navigation to a new location programmatically, you can
  do so by pushing a new state using the History API, and then manually
  calling the callback with the new location:
      window.history.pushState({}, '', '/new-route');
      handleNavigation(window.location);
  Optionally, you can use the second argument to read the event that caused the
  navigation. For example, you may want to scroll to top only after a link click.
      installRouter((location, event) => {
        // Only scroll to top on link clicks, not popstate events.
        if (event && event.type === 'click') {
          window.scrollTo(0, 0);
        }
        handleNavigation(location);
      });
*/
export const installRouter = (
  locationUpdatedCallback: LocationUpdatedCallback,
) => {
  document.body.addEventListener('click', (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey
    )
      return;

    const anchor = e
      .composedPath()
      .filter((n) => (n as HTMLElement).tagName === 'A')[0] as
      | HTMLAnchorElement
      | undefined;
    if (
      !anchor ||
      anchor.target ||
      anchor.hasAttribute('download') ||
      anchor.getAttribute('rel') === 'external'
    )
      return;

    const href = anchor.href;
    if (!href || href.indexOf('mailto:') !== -1) return;

    const location = window.location;
    const origin = location.origin || location.protocol + '//' + location.host;
    if (href.indexOf(origin) !== 0) return;

    e.preventDefault();
    if (href !== location.href) {
      window.history.pushState({}, '', href);
      locationUpdatedCallback(location, e);
    }
  });

  window.addEventListener('popstate', (e) =>
    locationUpdatedCallback(window.location, e),
  );
  locationUpdatedCallback(window.location, null /* event */);

  callbacks.push(locationUpdatedCallback);
};

export const navigateTo = (url: string) => {
  history.pushState({}, '', url);
  callbacks.forEach((callback) => callback(window.location, null));
};

export const redirectTo = (url: string) => {
  history.replaceState({}, '', url);
  callbacks.forEach((callback) => callback(window.location, null));
};
