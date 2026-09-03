(() => {
  const projects = window.TSTONE_PROJECTS || [];

  const esc = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const projectCard = (project, large = false) => `
    <article class="project-card ${large ? 'project-card--large' : ''} reveal" data-categories="${esc(project.categories.join('|'))}">
      <a class="project-card__image" href="project.html?id=${encodeURIComponent(project.id)}" aria-label="ดูรายละเอียด ${esc(project.title)}">
        <img src="${esc(project.image)}" alt="${esc(project.title)}" loading="lazy">
        <span class="project-card__year">${esc(project.year)}</span>
      </a>
      <div class="project-card__body">
        <div class="tag-row">${project.categories.slice(0, 3).map(c => `<span class="tag">${esc(c)}</span>`).join('')}</div>
        <h3><a href="project.html?id=${encodeURIComponent(project.id)}">${esc(project.title)}</a></h3>
        <p>${esc(project.summary)}</p>
        <a class="text-link" href="project.html?id=${encodeURIComponent(project.id)}">ดูโปรเจกต์ <span aria-hidden="true">↗</span></a>
      </div>
    </article>`;

  // แกลเลอรีรูปหน้างานจริง — คลิกแล้วเปิดดูเต็มจอ
  const gallerySection = (project) => {
    const shots = (project.gallery || []).filter(src => src !== project.image);
    if (!shots.length) return '';
    return `
      <section class="section section--white">
        <div class="container">
          <p class="eyebrow reveal">Gallery</p>
          <h2 class="gallery-title reveal">ภาพจากหน้างานจริง</h2>
          <div class="project-gallery reveal" data-gallery>
            ${shots.map((src, i) => `
              <button class="gallery-item" type="button" data-index="${i}">
                <img src="${esc(src)}" alt="${esc(project.title)} ${i + 1}" loading="lazy" decoding="async">
              </button>`).join('')}
          </div>
        </div>
      </section>`;
  };

  function setupLightbox(shots, title) {
    const grid = document.querySelector('[data-gallery]');
    if (!grid || !shots.length) return;
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `
      <button class="lightbox__close" aria-label="ปิด">✕</button>
      <button class="lightbox__nav lightbox__nav--prev" aria-label="ก่อนหน้า">‹</button>
      <img class="lightbox__img" alt="">
      <button class="lightbox__nav lightbox__nav--next" aria-label="ถัดไป">›</button>
      <div class="lightbox__count"></div>`;
    document.body.appendChild(box);
    const img = box.querySelector('.lightbox__img');
    const count = box.querySelector('.lightbox__count');
    let i = 0;
    const show = n => {
      i = (n + shots.length) % shots.length;
      img.src = shots[i];
      img.alt = `${title} ${i + 1}`;
      count.textContent = `${i + 1} / ${shots.length}`;
    };
    const open = n => { show(n); box.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
    const close = () => { box.classList.remove('is-open'); document.body.style.overflow = ''; };
    grid.addEventListener('click', e => {
      const b = e.target.closest('.gallery-item');
      if (b) open(+b.dataset.index);
    });
    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(i - 1));
    box.querySelector('.lightbox__nav--next').addEventListener('click', () => show(i + 1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
  }

  // แถบโลโก้ลูกค้า เลื่อนไปทางซ้ายไม่มีสะดุด ขอบสองข้างเฟดออก
  function renderClientMarquee() {
    const host = document.querySelector('[data-client-marquee]');
    const list = window.TSTONE_CLIENTS || [];
    if (!host || !list.length) return;

    const tile = c => `
      <div class="client-tile" title="${esc(c.name)}">
        ${c.logo
          ? `<img src="assets/images/clients/${esc(c.logo)}" alt="${esc(c.name)}" decoding="async"
                 onerror="this.closest('.client-tile').classList.add('is-text');this.remove()">`
          : ''}
        <span>${esc(c.name)}</span>
      </div>`;

    const row = list.map(tile).join('');
    // วางสองชุดต่อกัน พอเลื่อนครบชุดแรกก็วนกลับมาแบบเนียน
    host.innerHTML = `<div class="client-track">${row}${row}</div>`;
    host.style.setProperty('--client-count', list.length);
  }

  function setupNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');
    if (toggle && nav) {
      const closeNav = () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      };

      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
      });

      nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeNav();
      });
      addEventListener('resize', () => {
        if (innerWidth > 980) closeNav();
      }, { passive: true });
    }

    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) link.classList.add('is-active');
    });

    const header = document.querySelector('.site-header');
    const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 18);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function renderFeatured() {
    const target = document.querySelector('[data-featured-projects]');
    if (!target) return;
    const featured = projects.filter(p => p.featured).slice(0, 6);
    target.innerHTML = featured.map((p, i) => projectCard(p, i === 0 || i === 3)).join('');
  }

  function renderWork() {
    const grid = document.querySelector('[data-project-grid]');
    if (!grid) return;

    const filters = [...document.querySelectorAll('[data-filter]')];
    const search = document.querySelector('[data-project-search]');
    const count = document.querySelector('[data-project-count]');
    let active = 'All';

    const update = () => {
      const query = (search?.value || '').trim().toLowerCase();
      const visible = projects.filter(project => {
        const categoryMatch = active === 'All' || project.categories.includes(active);
        const haystack = [project.title, project.subtitle, project.summary, project.location, ...project.categories].join(' ').toLowerCase();
        return categoryMatch && (!query || haystack.includes(query));
      });
      grid.innerHTML = visible.map(p => projectCard(p)).join('') || '<div class="empty-state"><h3>ยังไม่พบงานที่ตรงกับการค้นหา</h3><p>ลองเปลี่ยนหมวดหรือใช้คำค้นที่สั้นลง</p></div>';
      if (count) count.textContent = `${visible.length} projects`;
      initReveal();
    };

    filters.forEach(button => button.addEventListener('click', () => {
      active = button.dataset.filter;
      filters.forEach(item => item.classList.toggle('is-active', item === button));
      update();
    }));
    search?.addEventListener('input', update);
    update();
  }

  function renderProjectDetail() {
    const target = document.querySelector('[data-project-detail]');
    if (!target) return;
    const id = new URLSearchParams(location.search).get('id');
    const project = projects.find(item => item.id === id) || projects[0];
    document.title = `${project.title} — T-Stone`;
    target.innerHTML = `
      <section class="project-hero">
        <div class="container project-hero__grid">
          <div class="project-hero__copy reveal">
            <a class="back-link" href="work.html">← กลับไปหน้า Work</a>
            <div class="tag-row">${project.categories.map(c => `<span class="tag">${esc(c)}</span>`).join('')}</div>
            <p class="eyebrow">${esc(project.subtitle)}</p>
            <h1>${esc(project.title)}</h1>
            <p class="lead">${esc(project.summary)}</p>
          </div>
          <figure class="project-hero__media reveal">
            <img src="${esc(project.image)}" alt="${esc(project.title)}">
          </figure>
        </div>
      </section>
      <section class="section">
        <div class="container project-info-grid">
          <div class="project-facts reveal">
            <div><span>ปี</span><strong>${esc(project.year)}</strong></div>
            <div><span>ช่วงเวลา</span><strong>${esc(project.date)}</strong></div>
            <div><span>สถานที่ / งาน</span><strong>${esc(project.location)}</strong></div>
          </div>
          <div class="project-story reveal">
            <p class="eyebrow">What we delivered</p>
            <h2>เทคโนโลยีที่ทำให้คนดู<br>กลายเป็นส่วนหนึ่งของงาน</h2>
            <ul class="feature-list">${project.features.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
        </div>
      </section>
      ${gallerySection(project)}
      <section class="section section--dark">
        <div class="container cta-panel reveal">
          <div><p class="eyebrow">Have a project in mind?</p><h2>สร้างประสบการณ์ใหม่ไปด้วยกัน</h2></div>
          <a class="button button--light" href="contact.html">คุยเรื่องโปรเจกต์ <span>↗</span></a>
        </div>
      </section>`;
    setupLightbox((project.gallery || []).filter(src => src !== project.image), project.title);
    initReveal();
  }

  function initReveal() {
    const elements = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach(el => observer.observe(el));
  }

  function setupContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(`Project enquiry: ${data.get('projectType') || 'Interactive project'}`);
      const body = encodeURIComponent([
        `ชื่อ: ${data.get('name') || ''}`,
        `บริษัท: ${data.get('company') || ''}`,
        `โทร: ${data.get('phone') || ''}`,
        `อีเมล: ${data.get('email') || ''}`,
        `ประเภทงาน: ${data.get('projectType') || ''}`,
        '',
        data.get('message') || ''
      ].join('\n'));
      location.href = `mailto:gino@t-stone.co.th?subject=${subject}&body=${body}`;
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  setupNavigation();
  renderClientMarquee();
  renderFeatured();
  renderWork();
  renderProjectDetail();
  setupContactForm();
  initReveal();
})();
