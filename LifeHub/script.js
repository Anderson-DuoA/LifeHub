/* ===========================================================
   LifeHub — Script Principal
   Animações suaves, navegação SPA, ícones Lucide SVG
   =========================================================== */

(function () {
  'use strict';

  // ——— Respeitar preferência de animação reduzida ———
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==============================
  //  1. PAGE LOADER
  // ==============================
  window.addEventListener('load', () => {
    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    const loader = document.getElementById('pageLoader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          loader.style.display = 'none';
          // Revelar animações do conteúdo inicial
          initScrollAnimations();
          animateCounters();
        }, 500);
      }, 600);
    }
  });

  // ==============================
  //  2. NAVEGAÇÃO SPA (showPage)
  // ==============================
  const pages = ['home', 'services', 'plans', 'about', 'login'];

  window.showPage = function (pageId) {
    // Atualizar nav
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`nav a[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Transição suave
    pages.forEach(p => {
      const el = document.getElementById(p);
      if (!el) return;
      if (p === pageId) {
        el.classList.remove('hidden');
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        el.style.transition = 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)';
        // Forçar reflow
        void el.offsetHeight;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      } else {
        el.classList.add('hidden');
        el.style.opacity = '';
        el.style.transform = '';
      }
    });

    // Scroll suave ao topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-inicializar ícones Lucide na nova página
    requestAnimationFrame(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      // Re-iniciar animações de scroll
      initScrollAnimations();
      animateCounters();
    });

    // Fechar menu mobile
    closeMenu();
  };

  // ==============================
  //  3. MOBILE MENU
  // ==============================
  window.toggleMenu = function () {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('menuToggle');
    const overlay = document.getElementById('navOverlay');
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
  };

  function closeMenu() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('menuToggle');
    const overlay = document.getElementById('navOverlay');
    if (nav) nav.classList.remove('active');
    if (toggle) toggle.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }

  // ==============================
  //  4. HEADER SCROLL EFFECT
  // ==============================
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (!header) return;
    const current = window.pageYOffset;

    if (current > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = current;
  }, { passive: true });

  // ==============================
  //  5. SCROLL ANIMATIONS (sutil)
  // ==============================
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => {
      // Pular se já foi animado e está visível
      if (el.classList.contains('animated')) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      el.style.transition = 'none';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay) || 0;

          setTimeout(() => {
            el.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.classList.add('animated');
          }, delay);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    elements.forEach(el => {
      if (!el.classList.contains('animated')) {
        observer.observe(el);
      }
    });
  }

  // ==============================
  //  6. ANIMATED COUNTERS
  // ==============================
  let countersAnimated = new Set();

  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const id = el.dataset.count + '-' + el.closest('section')?.className;
          if (countersAnimated.has(id)) return;
          countersAnimated.add(id);

          const target = parseInt(el.dataset.count);
          const duration = 1800;
          const start = performance.now();

          function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
          }

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(easeOutCubic(progress) * target);

            if (target >= 1000) {
              el.textContent = value.toLocaleString('pt-BR') + '+';
            } else {
              el.textContent = value;
            }

            if (progress < 1) {
              requestAnimationFrame(update);
            }
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  // ==============================
  //  7. FAQ ACCORDION
  // ==============================
  window.toggleFaq = function (btn) {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');

    // Fechar todas as outras
    document.querySelectorAll('.faq-item.open').forEach(i => {
      if (i !== item) i.classList.remove('open');
    });

    item.classList.toggle('open', !isOpen);
  };

  // ==============================
  //  8. SERVICE FILTER
  // ==============================
  window.filterServices = function (category, btn) {
    // Atualizar botão ativo
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filtrar cards
    const cards = document.querySelectorAll('#servicesPersonal .service-card');
    cards.forEach((card, i) => {
      const cat = card.dataset.category;
      const show = category === 'all' || cat === category;

      if (show) {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.display = '';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  };

  // ==============================
  //  9. AUTH TABS
  // ==============================
  window.switchAuthTab = function (tipo, btn) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tipo').value = tipo;

    // Alternar conteúdo do sidebar com transição suave
    const sidebarCliente = document.getElementById('sidebarCliente');
    const sidebarProfissional = document.getElementById('sidebarProfissional');
    if (!sidebarCliente || !sidebarProfissional) return;

    const hide = tipo === 'cliente' ? sidebarProfissional : sidebarCliente;
    const show = tipo === 'cliente' ? sidebarCliente : sidebarProfissional;

    hide.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    hide.style.opacity = '0';
    hide.style.transform = 'translateY(8px)';

    setTimeout(() => {
      hide.style.display = 'none';
      show.style.display = 'block';
      show.style.opacity = '0';
      show.style.transform = 'translateY(8px)';
      show.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      // Re-renderizar ícones no novo conteúdo
      if (typeof lucide !== 'undefined') lucide.createIcons();
      requestAnimationFrame(() => {
        show.style.opacity = '1';
        show.style.transform = 'translateY(0)';
      });
    }, 250);
  };

  // ==============================
  //  10. LOGIN SIMULATION
  // ==============================
  // Credenciais de demonstração
  const DEMO_PROF = { email: 'prof@lifehub.com', senha: 'lifehub123' };

  window.login = function (e) {
    e.preventDefault();
    const email    = document.getElementById('loginGmail').value.trim().toLowerCase();
    const senha    = document.getElementById('loginPassword').value;
    const tipo     = document.getElementById('tipo').value;
    const btn      = e.target.querySelector('button[type="submit"]');

    // Feedback visual no botão
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Entrar';

      // Login profissional demo
      if (tipo === 'profissional' && email === DEMO_PROF.email && senha === DEMO_PROF.senha) {
        showDashboard();
        return;
      }

      // Login cliente genérico (qualquer email válido)
      if (tipo === 'cliente' && email && senha.length >= 6) {
        showDashCliente(email);
        return;
      }

      // Credenciais erradas
      showToast('Email ou senha incorretos.', 'error');
    }, 800);
  };

  function showDashboard() {
    // Esconder todas as páginas normais
    ['home','services','plans','about','login'].forEach(p => {
      const el = document.getElementById(p);
      if (el) el.classList.add('hidden');
    });

    const dash = document.getElementById('dashboard');
    const footer = document.querySelector('footer');
    const header = document.getElementById('mainHeader');

    if (footer) footer.style.display = 'none';
    if (header) header.style.display = 'none';

    dash.classList.remove('hidden');
    dash.style.opacity = '0';
    dash.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => { dash.style.opacity = '1'; });

    if (typeof lucide !== 'undefined') lucide.createIcons();
    animateChartBars();
  }

  window.logout = function () {
    const dash   = document.getElementById('dashboard');
    const header = document.getElementById('mainHeader');
    const footer = document.querySelector('footer');

    dash.style.opacity = '0';
    setTimeout(() => {
      dash.classList.add('hidden');
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      document.getElementById('loginGmail').value = '';
      document.getElementById('loginPassword').value = '';
      showPage('login');
    }, 400);
  };

  // ==============================
  //  DASHBOARD CLIENTE
  // ==============================
  function showDashCliente(email) {
    ['home','services','plans','about','login'].forEach(p => {
      const el = document.getElementById(p);
      if (el) el.classList.add('hidden');
    });

    const nome = email.split('@')[0];
    const inicial = nome.charAt(0).toUpperCase();

    // Preencher dados dinâmicos
    ['clienteAvatar','clienteAvatarPerfil'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = inicial;
    });
    ['clienteNome','clienteNomePerfil'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = nome.charAt(0).toUpperCase() + nome.slice(1);
    });
    const emailPerfil = document.getElementById('clienteEmailPerfil');
    if (emailPerfil) emailPerfil.textContent = email;
    const emailInput = document.getElementById('clienteEmailInput');
    if (emailInput) emailInput.value = email;

    const dash = document.getElementById('dashCliente');
    const header = document.getElementById('mainHeader');
    const footer = document.querySelector('footer');

    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';

    dash.classList.remove('hidden');
    dash.style.opacity = '0';
    dash.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => { dash.style.opacity = '1'; });

    // Garantir aba inicial visível
    ['cAgendamentos','cPlano','cPerfil'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const inicio = document.getElementById('cInicio');
    if (inicio) inicio.style.display = '';

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  window.logoutCliente = function () {
    const dash   = document.getElementById('dashCliente');
    const header = document.getElementById('mainHeader');
    const footer = document.querySelector('footer');

    dash.style.opacity = '0';
    setTimeout(() => {
      dash.classList.add('hidden');
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      document.getElementById('loginGmail').value = '';
      document.getElementById('loginPassword').value = '';
      showPage('login');
    }, 400);
  };

  window.clienteTab = function (tab, link) {
    const tabMap = { inicio: 'cInicio', agendamentos: 'cAgendamentos', plano: 'cPlano', perfil: 'cPerfil' };
    const titleMap = { inicio: 'Início', agendamentos: 'Agendamentos', plano: 'Meu plano', perfil: 'Perfil' };

    document.querySelectorAll('#dashCliente .dash-nav-item').forEach(a => a.classList.remove('active'));
    if (link) link.classList.add('active');

    Object.values(tabMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const panel = document.getElementById(tabMap[tab]);
    if (panel) {
      panel.style.opacity = '0';
      panel.style.display = '';
      panel.style.transition = 'opacity 0.3s ease';
      requestAnimationFrame(() => { panel.style.opacity = '1'; });
    }

    const titleEl = document.getElementById('clienteTabTitle');
    if (titleEl) titleEl.textContent = titleMap[tab] || tab;

    // Fechar sidebar mobile
    const sidebar = document.querySelector('#dashCliente .dash-sidebar');
    const overlay = document.getElementById('dashClienteOverlay');
    if (sidebar) sidebar.classList.remove('dash-sidebar-open');
    if (overlay) overlay.classList.remove('dash-overlay-active');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  window.toggleClienteMenu = function () {
    const sidebar = document.querySelector('#dashCliente .dash-sidebar');
    const overlay = document.getElementById('dashClienteOverlay');
    if (sidebar) sidebar.classList.toggle('dash-sidebar-open');
    if (overlay) overlay.classList.toggle('dash-overlay-active');
  };

  window.toggleDashMenu = function () {
    const sidebar = document.querySelector('.dash-sidebar');
    const overlay = document.getElementById('dashOverlay');
    sidebar.classList.toggle('dash-sidebar-open');
    overlay.classList.toggle('dash-overlay-active');
  };

  // Navegação entre abas do dashboard
  window.dashTab = function (tab, link) {
    const tabMap = {
      overview: 'dashOverview',
      agenda:   'dashAgenda',
      clientes: 'dashClientes',
      ganhos:   'dashGanhos',
      perfil:   'dashPerfil',
    };
    const titleMap = {
      overview: 'Visão geral',
      agenda:   'Agenda',
      clientes: 'Clientes',
      ganhos:   'Ganhos',
      perfil:   'Meu perfil',
    };

    // Desativar todas as abas
    document.querySelectorAll('.dash-nav-item').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    // Esconder todos os paineis
    Object.values(tabMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Mostrar painel selecionado
    const panel = document.getElementById(tabMap[tab]);
    if (panel) {
      panel.style.opacity = '0';
      panel.style.display = '';
      panel.style.transition = 'opacity 0.3s ease';
      requestAnimationFrame(() => { panel.style.opacity = '1'; });
    }

    // Atualizar título
    const titleEl = document.getElementById('dashTabTitle');
    if (titleEl) titleEl.textContent = titleMap[tab] || tab;

    // Fechar sidebar no mobile ao trocar de aba
    const sidebar = document.querySelector('.dash-sidebar');
    const overlay = document.getElementById('dashOverlay');
    if (sidebar && sidebar.classList.contains('dash-sidebar-open')) {
      sidebar.classList.remove('dash-sidebar-open');
      if (overlay) overlay.classList.remove('dash-overlay-active');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // Animar barras do gráfico
  function animateChartBars() {
    const bars = document.querySelectorAll('.chart-bar');
    bars.forEach(bar => {
      const target = bar.style.height;
      bar.style.height = '0%';
      bar.style.transition = 'height 0.8s cubic-bezier(0.4,0,0.2,1)';
      setTimeout(() => { bar.style.height = target; }, 200);
    });
  }

  // ==============================
  //  11. TOAST NOTIFICATIONS
  // ==============================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;

    const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info';
    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:18px;height:18px;flex-shrink:0"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;padding:2px;display:flex">
        <i data-lucide="x" style="width:14px;height:14px"></i>
      </button>
    `;

    document.body.appendChild(toast);

    // Ícones no toast
    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ nodes: [toast] });
    }

    // Animar entrada
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    // Auto-remover
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }

  window.showToast = showToast;

  // ==============================
  //  12. BACK TO TOP
  // ==============================
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    if (window.pageYOffset > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==============================
  //  13. PARALLAX SUAVE (hero)
  // ==============================
  if (!prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const hero = document.querySelector('.hero');
      if (!hero || hero.closest('.hidden')) return;
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.12}px)`;
        hero.style.opacity = Math.max(1 - scrolled / (window.innerHeight * 1.2), 0);
      }
    }, { passive: true });
  }

  // ==============================
  //  14. CARD HOVER SUAVE (tilt)
  // ==============================
  if (!prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.service-card, .plan-card, .testimonial-card, .mvv-card, .value-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Tilt bem suave (máximo ~2-3 graus)
      const rotateX = ((y - centerY) / centerY) * -2;
      const rotateY = ((x - centerX) / centerX) * 2;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      card.style.transition = 'transform 0.15s ease-out';
    });

    document.addEventListener('mouseleave', (e) => {
      const card = e.target.closest('.service-card, .plan-card, .testimonial-card, .mvv-card, .value-card');
      if (!card) return;
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
    }, true);
  }

  // ==============================
  //  15. RIPPLE EFFECT (botões)
  // ==============================
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });

  // ==============================
  //  16. TYPED EFFECT (hero h1)
  // ==============================
  function initTypedEffect() {
    if (prefersReducedMotion) return;

    const highlight = document.querySelector('.hero .highlight');
    if (!highlight) return;

    const words = ['fácil', 'simples', 'prático', 'seguro'];
    let wordIndex = 0;

    setInterval(() => {
      highlight.style.opacity = '0';
      highlight.style.transition = 'opacity 0.3s ease';

      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        highlight.textContent = words[wordIndex];
        highlight.style.opacity = '1';
      }, 300);
    }, 3500);
  }

  window.addEventListener('load', () => {
    setTimeout(initTypedEffect, 1500);
  });

  // ==============================
  //  17. STAGGER CHILDREN
  // ==============================
  function staggerChildren(selector, delayIncrement = 60) {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(10px)';
            setTimeout(() => {
              child.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, i * delayIncrement);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  }

  // ==============================
  //  18. SERVICE CARD — AGENDAR CTA + MODAL
  // ==============================
  function injectServiceCtas() {
    document.querySelectorAll('.service-card').forEach(card => {
      if (card.querySelector('.service-cta')) return;
      const btn = document.createElement('button');
      btn.className = 'service-cta';
      btn.textContent = 'Agendar';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const serviceName = card.querySelector('h3')?.textContent || 'Serviço';
        openAgendamento(serviceName);
      });
      card.appendChild(btn);
    });
  }

  // --- Modal Agendamento ---
  window.openAgendamento = function (serviceName) {
    const modal = document.getElementById('modalAgendamento');
    const nameEl = document.getElementById('modalServiceName');
    if (nameEl) nameEl.textContent = serviceName;

    // Data mínima = hoje
    const agData = document.getElementById('agData');
    if (agData) {
      const hoje = new Date().toISOString().split('T')[0];
      agData.min = hoje;
      agData.value = '';
    }
    // Limpar form
    ['agNome','agTelefone','agHorario','agEndereco','agObs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  };

  window.closeAgendamento = function (e) {
    if (e && e.target !== document.getElementById('modalAgendamento')) return;
    const modal = document.getElementById('modalAgendamento');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  window.closeConfirmacao = function (e) {
    if (e && e.target !== document.getElementById('modalConfirmacao')) return;
    const modal = document.getElementById('modalConfirmacao');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  window.submitAgendamento = function (ev) {
    ev.preventDefault();
    const nome     = document.getElementById('agNome').value.trim();
    const tel      = document.getElementById('agTelefone').value.trim();
    const data     = document.getElementById('agData').value;
    const horario  = document.getElementById('agHorario').value;
    const endereco = document.getElementById('agEndereco').value.trim();
    const servico  = document.getElementById('modalServiceName').textContent;
    const btn      = document.getElementById('agSubmitBtn');

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    // Simular envio
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Confirmar agendamento';

      // Fechar modal de formulário
      document.getElementById('modalAgendamento').classList.remove('open');

      // Formatar data para exibição
      const dataFormatada = data
        ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
        : '';

      // Preencher modal de confirmação
      document.getElementById('modalConfirmText').textContent =
        `Entraremos em contato com ${nome.split(' ')[0]} para confirmar o horário em até 30 minutos.`;
      document.getElementById('modalConfirmDetail').innerHTML =
        `<strong>Serviço:</strong> ${servico}<br>` +
        `<strong>Data:</strong> ${dataFormatada} às ${horario}<br>` +
        `<strong>Endereço:</strong> ${endereco}<br>` +
        `<strong>Telefone:</strong> ${tel}`;

      const confirmModal = document.getElementById('modalConfirmacao');
      confirmModal.classList.add('open');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 900);
  };

  // Fechar modais com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('modalAgendamento')?.classList.remove('open');
      document.getElementById('modalConfirmacao')?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  window.addEventListener('load', () => {
    injectServiceCtas();
    staggerChildren('.plan-features');
    staggerChildren('.features-list');
  });

  // ==============================
  //  18. SMOOTH FOCUS (acessibilidade)
  // ==============================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

  // ==============================
  //  19. SCROLL PROGRESS (header)
  // ==============================
  if (!prefersReducedMotion) {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--primary-dark));
      z-index: 10001;
      transition: width 0.1s linear;
      width: 0%;
      border-radius: 0 2px 2px 0;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
  }

  // ==============================
  //  20. LINK HOVER MAGNÉTICO (nav)
  // ==============================
  if (!prefersReducedMotion) {
    document.querySelectorAll('nav a, .social-link').forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        link.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        link.style.transition = 'transform 0.15s ease-out';
      });

      link.addEventListener('mouseleave', () => {
        link.style.transform = '';
        link.style.transition = 'transform 0.3s ease';
      });
    });
  }

})();
