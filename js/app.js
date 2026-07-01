/* =====================================================
   CÁPSULA 1 · NAVEGACIÓN, PROGRESO E INTERACTIVIDAD
   Todo el almacenamiento se realiza en el navegador.
   ===================================================== */
(() => {
  'use strict';

  const prefijo = 'capsulaConjeturasPruebas';
  const pantallas = [...document.querySelectorAll('.pantalla')];
  const nodos = ['nodo1', 'nodo2', 'nodo3', 'nodo4'];

  const almacenamiento = {
    leer(clave, alternativa = '') {
      try { return localStorage.getItem(`${prefijo}:${clave}`) ?? alternativa; }
      catch (error) { return alternativa; }
    },
    guardar(clave, valor) {
      try { localStorage.setItem(`${prefijo}:${clave}`, valor); return true; }
      catch (error) { return false; }
    },
    borrar(clave) {
      try { localStorage.removeItem(`${prefijo}:${clave}`); }
      catch (error) { /* El sitio continúa funcionando sin almacenamiento. */ }
    }
  };

  const sesion = {
    leer(clave, alternativa = '') {
      try { return sessionStorage.getItem(`${prefijo}:${clave}`) ?? alternativa; }
      catch (error) { return alternativa; }
    },
    guardar(clave, valor) {
      try { sessionStorage.setItem(`${prefijo}:${clave}`, valor); }
      catch (error) { /* La actividad sigue funcionando sin persistencia temporal. */ }
    },
    borrar(clave) {
      try { sessionStorage.removeItem(`${prefijo}:${clave}`); }
      catch (error) { /* Sin efecto. */ }
    }
  };

  let visitados = new Set();
  try { visitados = new Set(JSON.parse(almacenamiento.leer('visitados', '[]'))); }
  catch (error) { visitados = new Set(); }

  function actualizarProgreso() {
    document.querySelectorAll('[data-estado]').forEach((elemento) => {
      const visto = visitados.has(elemento.dataset.estado);
      elemento.textContent = visto ? 'Visitado' : 'Pendiente';
      elemento.classList.toggle('visitado', visto);
    });
    const total = nodos.filter((id) => visitados.has(id)).length;
    const contador = document.getElementById('contador-progreso');
    if (contador) contador.textContent = `${total} de ${nodos.length}`;
  }

  function mostrarPantalla(id) {
    const destino = document.getElementById(id);
    if (!destino) return;
    pantallas.forEach((pantalla) => pantalla.classList.toggle('activa', pantalla === destino));
    destino.setAttribute('tabindex', '-1');
    destino.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (destino.dataset.nodo === 'true') {
      visitados.add(id);
      almacenamiento.guardar('visitados', JSON.stringify([...visitados]));
      actualizarProgreso();
    }
    try { history.replaceState(null, '', `#${id}`); }
    catch (error) { /* En algunos navegadores file:// restringe history. */ }
  }

  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-ir]');
    if (!boton) return;
    evento.preventDefault();
    mostrarPantalla(boton.dataset.ir);
  });

  /* =====================================================
     ACTIVIDAD INTERACTIVA DE TRES CASOS
     ===================================================== */
  const casos = [
    {
      titulo: 'Caso 1 · Una regularidad inesperada',
      texto: 'Un grupo calcula varios ejemplos, detecta un patrón, formula una conjetura y la modifica después de encontrar un contraejemplo. ¿Qué lectura es más adecuada?',
      opciones: [
        'Es un proceso del contexto de descubrimiento porque intervienen búsqueda, error, ejemplos y reformulación.',
        'Es una justificación completa porque muchos ejemplos equivalen a una demostración.',
        'No es actividad matemática hasta que el docente comunica la respuesta correcta.'
      ],
      correcta: 0,
      devoluciones: [
        'La escena reúne procesos que la actividad asocia con el descubrimiento. Reconocerlos como matemáticos no significa confundir la conjetura con una prueba.',
        'Los ejemplos pueden sostener una conjetura y orientar la búsqueda, pero no reemplazan automáticamente los criterios de justificación.',
        'La producción matemática no comienza únicamente con la validación docente. La escena permite discutir cómo se construye significado antes de formalizar.'
      ]
    },
    {
      titulo: 'Caso 2 · Una demostración sin historia',
      texto: 'Una clase comienza con el enunciado de un teorema y su demostración formal. Después se proponen ejercicios de aplicación. ¿Qué problema abre esta organización?',
      opciones: [
        'Ninguno: presentar primero la prueba garantiza por sí mismo la comprensión.',
        'Puede privilegiar la justificación y ocultar los problemas, intuiciones y errores que vuelven necesaria esa formalización.',
        'La demostración debería eliminarse porque el rigor es incompatible con la exploración.'
      ],
      correcta: 1,
      devoluciones: [
        'La validez de una prueba no garantiza que los estudiantes comprendan el problema que organiza el concepto ni cómo relacionarlo con otras ideas.',
        'La lectura no rechaza la demostración. Pregunta por las condiciones didácticas que permiten comprender por qué esa prueba aparece y qué resuelve.',
        'La actividad no propone abandonar la justificación. El desafío es articular exploración, discusión y rigor.'
      ]
    },
    {
      titulo: 'Caso 3 · Dos prompts, dos actividades',
      texto: 'Un prompt general produce una secuencia expositiva. Un segundo prompt explicita que se valoren conjeturas, errores, discusión e institucionalización. La segunda respuesta cambia. ¿Qué conclusión es más sólida?',
      opciones: [
        'La IA posee una perspectiva epistemológica estable e independiente de lo que se le pide.',
        'El prompt participa de la normatividad didáctica: explicitar supuestos puede orientar la propuesta, pero el docente debe analizar críticamente el resultado.',
        'La segunda respuesta es correcta solo porque es más extensa.'
      ],
      correcta: 1,
      devoluciones: [
        'La comparación propuesta en la actividad justamente busca examinar cuánto depende la respuesta de la formulación y de los supuestos introducidos.',
        'La explicitación puede modificar tareas, roles y lugar del error. La responsabilidad docente permanece porque una respuesta coherente en apariencia todavía necesita revisión.',
        'La extensión no garantiza coherencia epistemológica. Deben compararse tareas, roles, validación y concepción de matemática.'
      ]
    }
  ];

  let indiceCaso = Number(sesion.leer('indiceCaso', '0'));
  if (!Number.isInteger(indiceCaso) || indiceCaso < 0 || indiceCaso >= casos.length) indiceCaso = 0;
  const contenedorCaso = document.getElementById('caso-contenedor');

  function renderizarCaso() {
    if (!contenedorCaso) return;
    const caso = casos[indiceCaso];
    const opciones = caso.opciones.map((opcion, indice) =>
      `<button type="button" data-opcion="${indice}">${opcion}</button>`
    ).join('');
    contenedorCaso.innerHTML = `
      <p class="ceja">Caso ${indiceCaso + 1} de ${casos.length}</p>
      <h3>${caso.titulo}</h3>
      <p>${caso.texto}</p>
      <div class="caso-opciones">${opciones}</div>
      <div id="devolucion-caso" aria-live="polite"></div>`;
  }

  contenedorCaso?.addEventListener('click', (evento) => {
    const opcion = evento.target.closest('[data-opcion]');
    if (opcion) {
      const seleccion = Number(opcion.dataset.opcion);
      const caso = casos[indiceCaso];
      const acierto = seleccion === caso.correcta;
      const devolucion = document.getElementById('devolucion-caso');
      devolucion.className = `devolucion${acierto ? '' : ' atencion'}`;
      devolucion.innerHTML = `
        <strong>${acierto ? 'La lectura articula bien los conceptos.' : 'Esta opción deja un problema sin examinar.'}</strong>
        <p>${caso.devoluciones[seleccion]}</p>
        <button type="button" id="siguiente-caso" class="primario">${indiceCaso === casos.length - 1 ? 'Volver al primer caso' : 'Siguiente caso'}</button>`;
      contenedorCaso.querySelectorAll('[data-opcion]').forEach((boton) => { boton.disabled = true; });
      return;
    }
    if (evento.target.id === 'siguiente-caso') {
      indiceCaso = (indiceCaso + 1) % casos.length;
      sesion.guardar('indiceCaso', String(indiceCaso));
      renderizarCaso();
    }
  });

  document.getElementById('reiniciar-actividad')?.addEventListener('click', () => {
    indiceCaso = 0;
    sesion.borrar('indiceCaso');
    renderizarCaso();
  });

  /* =====================================================
     BITÁCORA LOCAL
     ===================================================== */
  const notaBitacora = document.getElementById('nota-bitacora');
  const estadoGuardado = document.getElementById('estado-guardado');
  if (notaBitacora) notaBitacora.value = almacenamiento.leer('bitacora');

  document.getElementById('guardar-bitacora')?.addEventListener('click', () => {
    const guardado = almacenamiento.guardar('bitacora', notaBitacora.value);
    estadoGuardado.textContent = guardado
      ? 'Bitácora guardada en este dispositivo.'
      : 'El navegador no permitió guardar. Copiá el texto antes de cerrar.';
  });

  document.getElementById('borrar-bitacora')?.addEventListener('click', () => {
    almacenamiento.borrar('bitacora');
    notaBitacora.value = '';
    estadoGuardado.textContent = 'Bitácora borrada.';
  });

  /* =====================================================
     LABORATORIO DE PROMPTS
     ===================================================== */
  const camposPrompt = ['tema-prompt', 'contexto-prompt', 'prompt-a', 'perspectiva-prompt', 'autores-prompt', 'prompt-b'];
  camposPrompt.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = almacenamiento.leer(`campo:${id}`);
  });

  function valor(id) { return document.getElementById(id)?.value.trim() || ''; }

  document.getElementById('armar-prompt-a')?.addEventListener('click', () => {
    const tema = valor('tema-prompt') || '[tema matemático]';
    const contexto = valor('contexto-prompt') || '[nivel y contexto]';
    document.getElementById('prompt-a').value = `Actuá como especialista en didáctica de la matemática. Diseñá una actividad para trabajar ${tema} en ${contexto}. Incluí propósito, consignas, organización de la clase, intervenciones docentes y criterios de evaluación.`;
  });

  document.getElementById('armar-prompt-b')?.addEventListener('click', () => {
    const tema = valor('tema-prompt') || '[tema matemático]';
    const contexto = valor('contexto-prompt') || '[nivel y contexto]';
    const perspectiva = valor('perspectiva-prompt') || '[perspectiva epistemológica y conceptos centrales]';
    const autores = valor('autores-prompt') || '[autores de referencia]';
    document.getElementById('prompt-b').value = `Actuá como especialista en didáctica de la matemática. Diseñá una actividad para trabajar ${tema} en ${contexto}. La propuesta debe ser coherente con esta perspectiva epistemológica: ${perspectiva}. Tomá como referencias para orientar el diseño a ${autores}. Hacé explícitos el rol del error, la exploración, la conjetura, la justificación, el papel del docente y del estudiante, y el momento de institucionalización del saber. Incluí criterios para revisar si la actividad sostiene efectivamente esos supuestos.`;
  });

  document.getElementById('guardar-prompts')?.addEventListener('click', () => {
    let exito = true;
    camposPrompt.forEach((id) => {
      const campo = document.getElementById(id);
      if (campo) exito = almacenamiento.guardar(`campo:${id}`, campo.value) && exito;
    });
    document.getElementById('estado-prompts').textContent = exito
      ? 'Borradores guardados en este dispositivo.'
      : 'El navegador no permitió guardar los borradores.';
  });

  document.getElementById('borrar-prompts')?.addEventListener('click', () => {
    camposPrompt.forEach((id) => {
      almacenamiento.borrar(`campo:${id}`);
      const campo = document.getElementById(id);
      if (campo) campo.value = '';
    });
    document.getElementById('estado-prompts').textContent = 'Borradores borrados.';
  });

  /* =====================================================
     PAUSA REFLEXIVA
     ===================================================== */
  const preguntasPausa = [
    '¿Qué parte de una clase de matemática suele quedar fuera cuando solo observamos el resultado final?',
    '¿Qué error de un estudiante podría convertirse en una pregunta productiva?',
    '¿Cuándo una demostración responde una necesidad y cuándo funciona como un ritual?',
    '¿Qué cambia en una actividad cuando el docente explicita su perspectiva epistemológica?',
    '¿Qué debería conservar una clase para articular búsqueda y rigor?'
  ];
  let indicePregunta = 0;
  document.getElementById('otra-pregunta')?.addEventListener('click', () => {
    indicePregunta = (indicePregunta + 1) % preguntasPausa.length;
    document.getElementById('pregunta-pausa').textContent = preguntasPausa[indicePregunta];
  });

  actualizarProgreso();
  renderizarCaso();
  const inicial = location.hash.slice(1);
  if (inicial && document.getElementById(inicial)) mostrarPantalla(inicial);
})();
