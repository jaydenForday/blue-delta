const dock = document.querySelector('.dock');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');

function closeMenu(restoreFocus = false) {
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const opening = menu.hidden;
  menu.hidden = !opening;
  menuToggle.setAttribute('aria-expanded', String(opening));
  if (opening) menu.querySelector('a').focus();
});
document.querySelector('.menu-close').addEventListener('click', () => closeMenu(true));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(true)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!dock.contains(event.target)) closeMenu();
});
document.addEventListener('focusin', event => {
  if (!dock.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 801px)').addEventListener('change', () => closeMenu());

// Future-page controls explain the demo instead of navigating away.
const notice = document.querySelector('.demo-notice');
const noticeMessage = document.querySelector('#demo-message');
let noticeTimer;
function dismissNotice() {
  clearTimeout(noticeTimer);
  notice.hidden = true;
  noticeMessage.textContent = '';
}
document.querySelectorAll('[data-demo]').forEach(button => {
  button.addEventListener('click', () => {
    clearTimeout(noticeTimer);
    notice.hidden = false;
    noticeMessage.textContent = 'Demo only — these buttons are for preview and don’t open pages, book appointments or submit enquiries.';
    noticeTimer = setTimeout(dismissNotice, 7000);
    if (menu.contains(button)) closeMenu(true);
  });
});
document.querySelector('.notice-close').addEventListener('click', dismissNotice);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') dismissNotice();
});

// Retain the native disclosure's keyboard behaviour; expand its pointer target.
document.querySelectorAll('.service-card').forEach(card => {
  const details = card.querySelector('details');
  const summary = details.querySelector('summary');
  const service = card.querySelector('h3').textContent;
  summary.setAttribute('aria-label', `Explore ${service}`);
  card.addEventListener('click', event => {
    if (event.target.closest('summary') || window.getSelection().toString()) return;
    details.open = !details.open;
  });
  details.addEventListener('toggle', () => {
    summary.firstChild.textContent = details.open ? 'Close service ' : 'Explore service ';
    summary.setAttribute('aria-label', `${details.open ? 'Close' : 'Explore'} ${service}`);
  });
});

// Match the reference's 10ms stagger and 600ms letter-roll transition.
document.querySelectorAll('.button > span:first-child').forEach(label => {
  const text = label.textContent;
  label.parentElement.setAttribute('aria-label', text);
  label.setAttribute('aria-hidden', 'true');
  label.classList.add('button-label');
  label.replaceChildren(...[...text].map((character, index) => {
    const span = document.createElement('span');
    span.className = 'button-character';
    span.textContent = character;
    span.style.transitionDelay = `${index * .01}s`;
    return span;
  }));
});

document.querySelector('#year').textContent = new Date().getFullYear();

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const matchMedia = gsap.matchMedia();
  matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
    document.body.classList.add('motion-ready');
    gsap.from('.hero-content > *', {y: 28, opacity: 0, duration: 1, stagger: .13, ease: 'power2.out'});
    gsap.from('.masthead', {opacity: 0, duration: 1});
    gsap.utils.toArray('.reveal').forEach(element => {
      gsap.from(element, {y: 36, opacity: 0, duration: .85, ease: 'power2.out', scrollTrigger: {trigger: element, start: 'top 92%', once: true}});
    });

    const words = document.querySelector('.text-reveal');
    const originalText = words.textContent;
    words.setAttribute('aria-label', originalText);
    words.replaceChildren(...originalText.split(' ').flatMap((word, index) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.setAttribute('aria-hidden', 'true');
      return index ? [document.createTextNode(' '), span] : [span];
    }));
    gsap.from('.text-reveal .word', {opacity: .2, stagger: .08, ease: 'none', scrollTrigger: {trigger: words, start: 'top 82%', end: 'bottom 55%', scrub: .6}});

    const headings = gsap.utils.toArray('.vision-words span');
    const sequence = gsap.timeline({scrollTrigger: {trigger: '.vision', start: 'top top', end: 'bottom bottom', scrub: .65}});
    sequence.to({}, {duration: .3});
    headings.slice(1).forEach((heading, index) => {
      sequence.to(headings[index], {yPercent: -120, opacity: 0, duration: 1, ease: 'power2.inOut'})
        .fromTo(heading, {yPercent: 120, y: 0, opacity: 0}, {yPercent: 0, opacity: 1, duration: 1, ease: 'power2.inOut'}, '<')
        .to({}, {duration: .4});
    });
    gsap.from('.footer-wordmark img', {y: 65, opacity: .3, ease: 'none', scrollTrigger: {trigger: '.footer-wordmark', start: 'top bottom', end: 'bottom bottom', scrub: .5}});

    return () => {
      document.body.classList.remove('motion-ready');
      words.textContent = originalText;
      words.removeAttribute('aria-label');
    };
  });

  document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', () => ScrollTrigger.refresh());
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

// Keep the floating menu clear of the footer; never hide focused controls.
const footerObserver = new IntersectionObserver(([entry]) => {
  dock.classList.toggle('is-hidden', entry.isIntersecting && !dock.contains(document.activeElement));
  if (entry.isIntersecting && !dock.contains(document.activeElement)) closeMenu();
}, {threshold: .25});
footerObserver.observe(document.querySelector('footer'));
