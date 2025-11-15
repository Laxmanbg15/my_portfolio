// Basic interactivity: nav toggle and small helpers
document.addEventListener('DOMContentLoaded', function(){
	const navToggle = document.getElementById('nav-toggle');
	const primaryNav = document.getElementById('primary-nav');
	const year = document.getElementById('year');

	if(year) year.textContent = new Date().getFullYear();

	if(navToggle && primaryNav){
		navToggle.addEventListener('click', ()=>{
			const expanded = navToggle.getAttribute('aria-expanded') === 'true';
			navToggle.setAttribute('aria-expanded', String(!expanded));
			// toggle menu visibility for small screens
			if(!expanded){
				primaryNav.style.display = 'block';
			} else {
				primaryNav.style.display = '';
			}
		});

		// Close menu when a nav link is clicked (mobile)
		primaryNav.addEventListener('click', (e)=>{
			if(e.target.tagName === 'A' && window.innerWidth < 700){
				navToggle.setAttribute('aria-expanded','false');
				primaryNav.style.display = '';
			}
		});
	}

	// Smooth scroll for same-page links
	// Smooth scroll for same-page links
	function smoothScrollTo(element, duration){
		const header = document.querySelector('.site-header');
		const headerOffset = header ? header.offsetHeight : 0;
		const startY = window.pageYOffset;
		const targetRect = element.getBoundingClientRect();
		const targetY = startY + targetRect.top - headerOffset - 12; // small gap
		const maxScroll = Math.max(0, targetY);
		const startTime = performance.now();
		function easeInOutCubic(t){
			return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
		}
		function step(now){
			const elapsed = now - startTime;
			const t = Math.min(1, elapsed / duration);
			const eased = easeInOutCubic(t);
			window.scrollTo(0, Math.round(startY + (maxScroll - startY) * eased));
			if(elapsed < duration) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	document.querySelectorAll('a[href^="#"]').forEach(a=>{
		a.addEventListener('click', function(e){
			const href = this.getAttribute('href');
			if(href.length > 1 && href.startsWith('#')){
				e.preventDefault();
				const el = document.querySelector(href);
				if(!el) return;
				// If link is inside header nav, use 2s custom scroll; else use native smooth
				if(this.closest && this.closest('#primary-nav')){
					// close mobile nav if open
					const navToggle = document.getElementById('nav-toggle');
					const primaryNav = document.getElementById('primary-nav');
					if(navToggle && primaryNav && window.innerWidth < 700){
						navToggle.setAttribute('aria-expanded','false');
						primaryNav.style.display = '';
					}
					smoothScrollTo(el, 1000);
					// update the URL hash without jumping
					history.pushState && history.pushState(null, '', href);
				} else {
					el.scrollIntoView({behavior:'smooth',block:'start'});
				}
			}
		});
	});

	// Theme toggle: persist choice and respect system preference
	const themeToggle = document.getElementById('theme-toggle');
	const root = document.documentElement;

	function applyTheme(theme){
		if(theme === 'light'){
			root.setAttribute('data-theme','light');
			if(themeToggle) themeToggle.setAttribute('aria-pressed','true');
			if(themeToggle && themeToggle.querySelector('.theme-icon')) themeToggle.querySelector('.theme-icon').textContent = '☀️';
		} else {
			root.removeAttribute('data-theme');
			if(themeToggle) themeToggle.setAttribute('aria-pressed','false');
			if(themeToggle && themeToggle.querySelector('.theme-icon')) themeToggle.querySelector('.theme-icon').textContent = '🌙';
		}
	}

	function getPreferredTheme(){
		const stored = localStorage.getItem('theme');
		if(stored) return stored;
		return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	}

	// initialize theme on load
	const initial = getPreferredTheme();
	applyTheme(initial);

	if(themeToggle){
		themeToggle.addEventListener('click', ()=>{
			const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
			const next = current === 'light' ? 'dark' : 'light';
			applyTheme(next);
			localStorage.setItem('theme', next);
		});
	}

	// Animate skill bars and reveal project cards when scrolled into view
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const skillSpans = document.querySelectorAll('.skill-bar span');
	const projectCards = document.querySelectorAll('.project-card');

	if(prefersReduced){
		// Immediately set widths without animation
		skillSpans.forEach(s => {
			const lvl = s.dataset.level || '0';
			s.style.width = lvl + '%';
		});
		projectCards.forEach(c => c.classList.add('revealed'));
	} else {
		const io = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if(entry.isIntersecting){
					const target = entry.target;
					if(target.matches && target.matches('.skill-bar span')){
						const lvl = target.dataset.level || '0';
						target.style.width = lvl + '%';
						observer.unobserve(target);
					}
					if(target.classList && target.classList.contains('project-card')){
						target.classList.add('revealed');
						observer.unobserve(target);
					}
				}
			});
		},{threshold:0.25});

		skillSpans.forEach(s => io.observe(s));
		projectCards.forEach(c => io.observe(c));
	}
});

