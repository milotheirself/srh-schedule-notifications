const resolve = () => {
  try {
    const internal = {};

    internal.requestNonce = () => {
      let idstr = String.fromCharCode(Math.floor(Math.random() * 25 + 65));

      do {
        let ascicode = Math.floor(Math.random() * 42 + 48);
        if (ascicode < 58 || ascicode > 64) {
          idstr += String.fromCharCode(ascicode);
        }
      } while (idstr.length < 32);

      return idstr;
    };

    const result = {};

    [...document.querySelector('.timetableView').children].forEach((node) => {
      // +
      const wee = internal.requestNonce();
      const cap = node.querySelector('.title').textContent.replaceAll('_', ' ').replaceAll('  ', ' ');
      result[wee] = {
        // ---
        // FIXME: as we only care about specific table updates; this date is irrelevant
        changed: ((str) => {
          const tim = str.split(' ');
          const val = tim[0].split('.');
          return new Date(`${val[1]}.${val[0]}.${val[2]} ${tim[1]}`).getTime();
        })(node.querySelector('.meta').textContent),
        // ---

        caption: cap,
        element: {},
      };

      // +
      const urn = node.querySelector('.preview').src;
      const que = urn.slice(urn.indexOf('?f=') + 3);
      const uid = que.split('/').slice(0, 2).join('/');

      for (let i = 0; i < parseInt(node.querySelector('.page').textContent); i++) {
        const pla = internal.requestNonce();
        const nam = `c${('00000' + (i + 1)).slice(-5)}.htm`;

        result[wee].element[pla] = {
          source: { urn: `https://dsbmobile.de/data/${uid}/${nam}` },
          caption: null,
          content: null,
        };
      }
    });

    return result;
  } catch (err) {
    console.log(err);
    return {};
  }
};

// ---
resolve();
// evaluate => {
//   <nonce>: {
//     title: String,
//     plans: {
//       <nonce>: { urn: String },
//       < ... >: {     ...     }
//     },
//   },
//   < ... > : { ... }
// };
// ---
