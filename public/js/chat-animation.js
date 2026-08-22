(() => {
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (root) => {
    const items = Array.from(root.children).filter(
      (el) => el.hasAttribute('data-step') || el.hasAttribute('data-typing'),
    );

    if (REDUCED) {
      items.forEach((el) => {
        if (el.hasAttribute('data-typing')) el.remove();
        else el.classList.add('is-visible');
      });
      return;
    }

    let timers = [];
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    const play = () => {
      clear();
      items.forEach((el) => {
        if (el.hasAttribute('data-typing')) el.hidden = true;
        else el.classList.remove('is-visible');
      });

      let t = 300;
      items.forEach((el) => {
        if (el.hasAttribute('data-typing')) {
          timers.push(
            setTimeout(() => {
              el.hidden = false;
            }, t),
          );
          t += 1000;
          timers.push(
            setTimeout(() => {
              el.hidden = true;
            }, t),
          );
        } else {
          timers.push(
            setTimeout(() => {
              el.classList.add('is-visible');
            }, t),
          );
          t += 900;
        }
      });

      t += 2400;
      timers.push(setTimeout(play, t));
    };

    play();
  };

  document.querySelectorAll('[data-chat-anim]').forEach(animate);
})();
