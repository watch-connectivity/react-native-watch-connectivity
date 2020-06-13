**updateApplicationContext has the following advantages:**

- The transfer takes place in the background, even when the paired app is not open. The data gets transmitted, is held for your app, and then received once you open your app.
- The transfer always contains the most recent state of your tasks. Any later transfer replaces any earlier transmitted application context data. You don't have to process multiple user info data, applying older data, change by change, which might be superseded by newer info further back in the queue.
