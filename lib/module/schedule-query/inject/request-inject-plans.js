const resolve = () => {
  try {
    const node = [...document.querySelector('.timetableView').children][0];
    // +
    const urn = node.querySelector('.preview').src;
    const que = urn.slice(urn.indexOf('?f=') + 3);
    const uid = que.split('/').slice(0, 2).join('/');

    return { urn: `https://dsbmobile.de/data/${uid}/index.html` };
  } catch (err) {
    console.log(err);
    return { invalid: true };
  }
};

resolve();
