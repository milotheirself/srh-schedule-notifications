const fragment = {};
const internal = {};

fragment.create = () => {
  return new (class {
    #listeners = {};

    once(nonce, method) {
      let temp = () => {
        this.detach(nonce, temp);
        method(...arguments);
      };

      this.on(nonce, temp);
    }

    on(nonce, method) {
      if (!this.#listeners[nonce]) {
        this.#listeners[nonce] = [];
      }

      this.#listeners[nonce].push(method);
    }

    detach(nonce, method) {
      let idx;

      if (typeof this.#listeners[nonce] === 'object') {
        idx = this.#listeners[nonce].indexOf(method);

        if (idx > -1) {
          this.#listeners[nonce].splice(idx, 1);
        }
      }
    }

    dispatch(nonce, ...args) {
      let i, methods, length;

      if (typeof this.#listeners[nonce] === 'object') {
        methods = this.#listeners[nonce].slice();
        length = methods.length;

        for (i = 0; i < length; i++) {
          methods[i].apply(this, args);
        }
      }
    }
  })();
};

export default { ...fragment };
