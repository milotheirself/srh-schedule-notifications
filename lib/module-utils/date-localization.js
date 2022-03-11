const fragment = {};
const internal = {};

fragment.create = ({ tim }) => {
  return {
    full: internal.dateFull({ tim }),
    abbreviated: internal.date({ tim }),
  };
};

// +
internal.nameMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
internal.nameDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// +
internal.dateFull = ({ tim }) => {
  const curre = new Date(tim);

  // +
  const d = curre.getDay();
  const m = curre.getMonth();
  const y = internal.padInt(curre.getFullYear(), 4);

  // +
  const h = internal.padInt(curre.getHours(), 2);
  const t = internal.padInt(curre.getMinutes(), 2);

  // => "{day}, D {month} YYYY hh:mm"
  return `${internal.nameDay[d]}, ${d} ${internal.nameMonth[m]} ${y} ${h}:${t}`;
};

// +
internal.date = ({ tim }) => {
  const curre = new Date(tim);
  const curreStart = new Date(tim);
  const todayStart = new Date();

  // +
  todayStart.setHours(0, 0, 0, 0);
  curreStart.setHours(0, 0, 0, 0);

  // + older then 2 days => "DD/MM/YYYY"
  if (todayStart.getTime() - curreStart.getTime() >= 86400000 * 2) {
    const d = internal.padInt(curre.getDate(), 2);
    const m = internal.padInt(curre.getMonth(), 2);
    const y = internal.padInt(curre.getFullYear(), 4);

    return `${d}/${m}/${y}`;
  }

  // + current => "Yesterday at hh:mm" or "Today at hh:mm"
  else {
    const h = internal.padInt(curre.getHours(), 2);
    const t = internal.padInt(curre.getMinutes(), 2);
    const d =
      todayStart.getTime() - curreStart.getTime() >= 86400000 //
        ? 'Yesterday'
        : 'Today';

    // +
    return `${d} at ${h}:${t}`;
  }
};

// +
internal.padInt = (int, length) => {
  return `${int}`.length >= length ? `${int}` : internal.padInt(`0${int}`, length);
};

// +
export default { ...fragment };
