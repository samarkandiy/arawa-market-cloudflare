// View Transition API helper
export const startViewTransition = (callback: () => void) => {
  // Check if View Transitions API is supported
  if ('startViewTransition' in document) {
    (document as any).startViewTransition(callback);
  } else {
    // Fallback for unsupported browsers
    callback();
  }
};
