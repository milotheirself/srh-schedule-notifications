const resolve = () => {
  try {
    // ?
    document.head.innerHTML += `
      <style> 
        body, body * {
          box-sizing: border-box;
        }
        body {
          margin: 0px; 
          padding: 10px; 

          overflow: auto;
        }
      
        center > table {
          margin: 10px 0px 0px;
        }

        center > table > tbody > tr > td:first-child {
          min-width: 50px;
        }
        center > table > tbody > tr > td:not(:first-child) {
          min-width: 180px;
        }

        center > table > * > td {
          padding: 5px 5px;
        }

        *,
        b {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 1rem !important;
          font-weight: 400 !important;

          color: unset;
        }
        table b {
          font-weight: 600 !important;
        }

        center > table:not(:first-of-type), 
        center > font:last-child, 
        br {
          display: none;
        }
      </style>
    `;

    // ? area to capture
    const wid = Math.max(840, document.querySelector('center > table').offsetWidth + 20);
    const hei = Math.max(600, document.querySelector('center').offsetHeight + 20);

    // ? hashable value
    const val = document.querySelector('table').innerText.replace(/[ -.:\r\n\t]/gm, '');

    // ?
    return { hei, wid, val };
  } catch (error) {
    return { hei: 10, wid: 10 };
  }
};

resolve();

// ----
// const internal = {};

// internal.requestNonce = () => {
//   let idstr = String.fromCharCode(Math.floor(Math.random() * 25 + 65));

//   do {
//     let ascicode = Math.floor(Math.random() * 42 + 48);
//     if (ascicode < 58 || ascicode > 64) {
//       idstr += String.fromCharCode(ascicode);
//     }
//   } while (idstr.length < 32);

//   return idstr;
// };

// internal.BREAK = '\n';
// internal.SPLIT = ';';

// /* */

// internal.table = {};
// internal.interpretPlan = ({ nodeTable, nodeTexts }) => {
//   const nodeRows = [...nodeTable.children[0].children].filter((r) => r.children.length > 0);

//   // +
//   const nodeSize = [nodeRows.length, 0];
//   [...nodeRows].forEach((row) => {
//     if (nodeSize[1] < row.children.length) nodeSize[1] = row.children.length;
//   });

//   // +
//   const result = [];
//   for (let j = 0; j < nodeSize[1]; j++) {
//     for (let i = 0; i < nodeSize[0]; i++) {
//       if (!result[i]) result[i] = [];
//       const nodeCell = nodeRows[i].children[j];
//       const value = !nodeCell
//         ? []
//         : [...nodeCell.querySelectorAll('tr')] //
//             .map((tr) =>
//               [...tr.querySelectorAll('td')] //
//                 .map((td) => (td.children[0] ? td.children[0].textContent.replaceAll('\n', '') : null))
//                 .filter((td) => !!td)
//                 .join(internal.SPLIT)
//                 .replaceAll('.', '')
//             )
//             .join(internal.BREAK);

//       let rowspan = !nodeCell ? 1 : (parseInt(nodeCell.getAttribute('rowspan')) || 2) / 2;
//       let content = value.length ? value : null;
//       for (let k = 0; k < rowspan; k++) {
//         if (!result[i + k][j]) result[i + k][j] = content;
//         if (k > 0) {
//           const filler = document.createElement('td');
//           nodeRows[i + k].insertBefore(filler, nodeRows[i + k].children[j]);
//         }
//       }
//     }
//   }

//   // +
//   const plain = [...nodeTexts].map((t) => t.textContent);
//   const texts = [];
//   texts.push(plain[2].split('\n')[1]);
//   texts.push(plain[1].split('\n')[1].split(' - ')[0]);
//   texts.push(plain[1].split('\n')[1].split(' - ')[1]);
//   // texts.push(plain[3].split('\n')[2]);
//   texts.push(plain[4].split('\n')[2].split('(')[0].split(' - ')[0].trim());
//   texts.push(plain[4].split('\n')[2].split('(')[0].split(' - ')[1].trim());
//   return { table: result, texts };
// };

// internal.translateTable = ({ table, texts }) => {
//   table.shift(); // remove day header
//   const result = {};
//   // + times
//   const times = [];
//   for (let i = 0; i < table.length; i++) {
//     if (!table[i][0]) continue;
//     const time = table[i][0]; // remove time
//     const timeSplit = time.split(internal.BREAK).map((t) => t.split(':').map((n) => parseInt(n)));
//     times.push({
//       ent: timeSplit[0][0] + timeSplit[0][1] / 60, //
//       out: timeSplit[1][0] + timeSplit[1][1] / 60,
//       typ: 0,
//     });
//   }
//   // + tasks
//   const tasks = [];
//   for (let j = 1; j < table[0].length; j++) {
//     for (let i = 0; i < table.length; i++) {
//       if (!table[i][j]) continue;
//       let ent = i;
//       let out = i;
//       for (let k = 1; i + k < table.length && table[i][j] == table[i + k][j]; k++) {
//         table[i + k][j] = null;
//         out = ent + k;
//       }
//       const cel = table[i][j].split(internal.BREAK).map((c) => c.split(internal.SPLIT));
//       tasks.push({
//         day: j - 1,
//         ent,
//         out,
//         content: {
//           sub: cel[0] ? cel[0][0] || null : null, // subject
//           lec: cel[0] ? cel[0][1] || null : null, // lecturer
//           loc: cel[0] ? cel[0][2] || null : null, // location
//           cap: cel[1] ? cel[1][0] || null : null, // caption
//         },
//       });
//     }
//   }

//   // + times/breaks
//   result.times = [];
//   for (let i = 0; i < times.length; i++) {
//     result.times.push(times[i]);
//     if (i + 1 >= times.length) continue;
//     let len = times[i + 1].ent - times[i].out;
//     if (len <= 0.01) continue;
//     tasks.forEach((t) => {
//       if (t.ent >= result.times.length) t.ent++;
//       if (t.out >= result.times.length) t.out++;
//     });
//     result.times.push({
//       ent: times[i].out, //
//       out: times[i].out + len,
//       typ: 1,
//     });
//   }

//   // + tasks/rooms
//   result.tasks = [];
//   result.rooms = [];
//   for (let i = 0; i < tasks.length; i++) {
//     result.tasks.push(tasks[i]);
//     if (
//       result.rooms.length > 0 && //
//       tasks[i - 1].day == tasks[i].day &&
//       tasks[i - 1].content.loc == tasks[i].content.loc
//     ) {
//       result.rooms[result.rooms.length - 1].out = tasks[i].out;
//       continue;
//     }
//     result.rooms.push({
//       day: tasks[i].day,
//       ent: tasks[i].ent,
//       out: tasks[i].out,
//       content: {
//         loc: tasks[i].content.loc,
//       },
//     });
//   }

//   return {
//     caption: `${texts[1]}`.replace(/ +(?= )/g, ''),
//     content: result,
//   };
// };

// const node = document.createElement('template');
// const html = document.body.parentElement.outerHTML;

// node.innerHTML = html;
// const int = internal.interpretPlan({
//   nodeTable: node.content.querySelector('table'),
//   nodeTexts: node.content.querySelectorAll('center > font'),
// });

// const { caption, content } = internal.translateTable(int);
// ----
