/*!
 * Galeria Polinésia — grade com rodízio + passador.
 * Um componente só, usado pelo site de vendas e pela página pública de unidades.
 *
 * REGRA DA GRADE: exibe o maior múltiplo de 3 que couber no total. Com 14 fotos a grade
 * mostra 12; com 11 mostra 9. As que sobram não somem: entram em rodízio, uma por vez,
 * num slot sorteado, a cada 8 a 10 segundos (intervalo aleatório pra não ficar mecânico).
 *
 * O PASSADOR MOSTRA O TOTAL. O corte é só da grade — quem abre a foto navega pelas 14.
 *
 * CUIDADOS DE VELOCIDADE (o motivo de cada um):
 *  - pré-carrega só a PRÓXIMA da fila, não todas: foto que roda é foto que baixa, e quem
 *    paga é o celular do hóspede em dados móveis;
 *  - para o rodízio quando a aba sai de vista, senão fica consumindo dados à toa;
 *  - para enquanto o passador está aberto, pra não trocar a foto embaixo de quem olha;
 *  - troca com fade em slot de altura fixa, senão o Google marca instabilidade de layout;
 *  - respeita quem desligou animação no sistema: nesse caso a grade fica parada.
 */
(function (global) {
  'use strict';

  function sorteio(a, b) { return a + Math.random() * (b - a); }

  function Galeria(opcoes) {
    var cfg = Object.assign({
      grade: null,              // elemento da grade
      seletorItem: '.gal-slot', // slots dentro da grade
      fotos: [],                // [{full, thumb, legenda}]
      minIntervalo: 8000,
      maxIntervalo: 10000,
      rodizio: true
    }, opcoes || {});

    var grade = typeof cfg.grade === 'string' ? document.querySelector(cfg.grade) : cfg.grade;
    if (!grade || !cfg.fotos.length) return null;

    var total = cfg.fotos.length;
    var visiveis = Math.max(3, Math.floor(total / 3) * 3);
    if (visiveis > total) visiveis = total;

    // naGrade[i] = índice da foto que está no slot i
    var naGrade = [];
    for (var i = 0; i < visiveis; i++) naGrade.push(i);
    var fila = [];
    for (var j = visiveis; j < total; j++) fila.push(j);

    var slots = [].slice.call(grade.querySelectorAll(cfg.seletorItem)).slice(0, visiveis);
    var timer = null, pausado = false;
    var semAnimacao = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function pinta(slot, idx, comFade) {
      var f = cfg.fotos[idx], img = slot.querySelector('img');
      if (!img) return;
      var cap = slot.querySelector('.gal-cap');
      function aplica() {
        img.src = f.thumb || f.full;
        img.alt = f.legenda || '';
        if (cap) cap.textContent = f.legenda || '';
        slot.dataset.foto = idx;
        img.style.opacity = '';
      }
      if (comFade && !semAnimacao) {
        img.style.transition = 'opacity .45s ease';
        img.style.opacity = '0';
        setTimeout(aplica, 450);
      } else { aplica(); }
    }

    slots.forEach(function (s, i) { pinta(s, naGrade[i], false); });

    function preCarrega(idx) {
      if (idx == null) return;
      var f = cfg.fotos[idx];
      var im = new Image();
      im.src = f.thumb || f.full;
    }

    function gira() {
      if (pausado || !fila.length || document.hidden) return agenda();
      var entra = fila.shift();
      var slot = Math.floor(Math.random() * slots.length);
      var sai = naGrade[slot];
      naGrade[slot] = entra;
      fila.push(sai);
      pinta(slots[slot], entra, true);
      preCarrega(fila[0]);          // só a próxima
      agenda();
    }

    function agenda() {
      clearTimeout(timer);
      if (!cfg.rodizio || !fila.length || semAnimacao) return;
      timer = setTimeout(gira, sorteio(cfg.minIntervalo, cfg.maxIntervalo));
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(timer); else agenda();
    });

    preCarrega(fila[0]);
    agenda();

    return {
      total: total,
      visiveis: visiveis,
      // o passador manda pausar enquanto está aberto
      pausar: function () { pausado = true; clearTimeout(timer); },
      retomar: function () { pausado = false; agenda(); },
      // qual foto está num slot agora — o passador precisa disso pra abrir a certa
      fotoDoSlot: function (i) { return naGrade[i]; }
    };
  }

  global.PolinesiaGaleria = Galeria;
})(window);
