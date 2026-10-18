// Distribuciones de teclado (ISO español). Cada fila es una lista de teclas:
// [código de KeyboardEvent, rótulo, ancho en unidades (1u = 19,05 mm), papel: 'letra' | 'mod' | 'acento'].
// null deja un hueco del ancho indicado (separaciones entre bloques).

const F = (n) => [`F${n}`, `F${n}`, 1, 'mod'];
const L = (code, rotulo) => [code, rotulo, 1, 'letra'];
const hueco = (u) => [null, '', u, null];

const fNum = [
  ['Backquote', 'º', 1, 'letra'], L('Digit1', '1'), L('Digit2', '2'), L('Digit3', '3'), L('Digit4', '4'), L('Digit5', '5'),
  L('Digit6', '6'), L('Digit7', '7'), L('Digit8', '8'), L('Digit9', '9'), L('Digit0', '0'), L('Minus', "'"), L('Equal', '¡'),
];
const fQ = [L('KeyQ', 'Q'), L('KeyW', 'W'), L('KeyE', 'E'), L('KeyR', 'R'), L('KeyT', 'T'), L('KeyY', 'Y'), L('KeyU', 'U'), L('KeyI', 'I'), L('KeyO', 'O'), L('KeyP', 'P'), L('BracketLeft', '`'), L('BracketRight', '+')];
const fA = [L('KeyA', 'A'), L('KeyS', 'S'), L('KeyD', 'D'), L('KeyF', 'F'), L('KeyG', 'G'), L('KeyH', 'H'), L('KeyJ', 'J'), L('KeyK', 'K'), L('KeyL', 'L'), L('Semicolon', 'Ñ'), L('Quote', '´'), L('Backslash', 'Ç')];
const fZ = [L('IntlBackslash', '<'), L('KeyZ', 'Z'), L('KeyX', 'X'), L('KeyC', 'C'), L('KeyV', 'V'), L('KeyB', 'B'), L('KeyN', 'N'), L('KeyM', 'M'), L('Comma', ','), L('Period', '.'), L('Slash', '-')];

const esc = ['Escape', 'Esc', 1, 'acento'];
const borrar = ['Backspace', 'Borrar', 2, 'mod'];
const tab = ['Tab', 'Tab', 1.5, 'mod'];
const bloq = ['CapsLock', 'Bloq', 1.75, 'mod'];
const intro = ['Enter', 'Intro', 1.25, 'acento'];
const shiftI = ['ShiftLeft', 'Mayús', 1.25, 'mod'];
const espacio = ['Space', '', 6.25, 'letra'];
const inferiorIzq = [['ControlLeft', 'Ctrl', 1.25, 'mod'], ['MetaLeft', 'Win', 1.25, 'mod'], ['AltLeft', 'Alt', 1.25, 'mod']];
const flechas = { arriba: ['ArrowUp', '↑', 1, 'mod'], izq: ['ArrowLeft', '←', 1, 'mod'], abajo: ['ArrowDown', '↓', 1, 'mod'], der: ['ArrowRight', '→', 1, 'mod'] };

export const DISTRIBUCIONES = {
  '60': {
    nombre: '60 %',
    detalle: 'Lo justo: sin flechas ni fila de funciones. Ocupa muy poco en la mesa.',
    filas: [
      [esc, ...fNum.slice(1), borrar],
      [tab, ...fQ, ['', '', 1.5, null]],
      [bloq, ...fA, intro],
      [shiftI, ...fZ, ['ShiftRight', 'Mayús', 2.75, 'mod']],
      [...inferiorIzq, espacio, ['AltRight', 'AltGr', 1.25, 'mod'], ['MetaRight', 'Fn', 1.25, 'mod'], ['ContextMenu', 'Menú', 1.25, 'mod'], ['ControlRight', 'Ctrl', 1.25, 'mod']],
    ],
  },
  '65': {
    nombre: '65 %',
    detalle: 'Un 60 % con flechas y una columna de navegación. El equilibrio más vendido.',
    filas: [
      [esc, ...fNum.slice(1), borrar, ['Delete', 'Supr', 1, 'mod']],
      [tab, ...fQ, ['', '', 1.5, null], ['PageUp', 'RePág', 1, 'mod']],
      [bloq, ...fA, intro, ['PageDown', 'AvPág', 1, 'mod']],
      [shiftI, ...fZ, ['ShiftRight', 'Mayús', 1.75, 'mod'], flechas.arriba, ['End', 'Fin', 1, 'mod']],
      [...inferiorIzq, espacio, ['AltRight', 'AltGr', 1, 'mod'], ['MetaRight', 'Fn', 1, 'mod'], ['ControlRight', 'Ctrl', 1, 'mod'], flechas.izq, flechas.abajo, flechas.der],
    ],
  },
  '75': {
    nombre: '75 %',
    detalle: 'Con fila de funciones y flechas, todo junto en un bloque compacto.',
    filas: [
      [esc, F(1), F(2), F(3), F(4), F(5), F(6), F(7), F(8), F(9), F(10), F(11), F(12), ['Delete', 'Supr', 1, 'mod'], ['Home', 'Inicio', 1, 'mod']],
      [...fNum, borrar, ['PageUp', 'RePág', 1, 'mod']],
      [tab, ...fQ, ['', '', 1.5, null], ['PageDown', 'AvPág', 1, 'mod']],
      [bloq, ...fA, intro, ['End', 'Fin', 1, 'mod']],
      [shiftI, ...fZ, ['ShiftRight', 'Mayús', 1.75, 'mod'], flechas.arriba, hueco(1)],
      [...inferiorIzq, espacio, ['AltRight', 'AltGr', 1, 'mod'], ['MetaRight', 'Fn', 1, 'mod'], ['ControlRight', 'Ctrl', 1, 'mod'], flechas.izq, flechas.abajo, flechas.der],
    ],
  },
  tkl: {
    nombre: 'TKL',
    detalle: 'Teclado completo sin bloque numérico. Para quien no quiere renunciar a nada.',
    filas: [
      [esc, hueco(1), F(1), F(2), F(3), F(4), hueco(0.5), F(5), F(6), F(7), F(8), hueco(0.5), F(9), F(10), F(11), F(12), hueco(0.25), ['PrintScreen', 'Impr', 1, 'mod'], ['ScrollLock', 'Bloq', 1, 'mod'], ['Pause', 'Pausa', 1, 'mod']],
      [...fNum, borrar, hueco(0.25), ['Insert', 'Ins', 1, 'mod'], ['Home', 'Inicio', 1, 'mod'], ['PageUp', 'RePág', 1, 'mod']],
      [tab, ...fQ, ['', '', 1.5, null], hueco(0.25), ['Delete', 'Supr', 1, 'mod'], ['End', 'Fin', 1, 'mod'], ['PageDown', 'AvPág', 1, 'mod']],
      [bloq, ...fA, intro],
      [shiftI, ...fZ, ['ShiftRight', 'Mayús', 2.75, 'mod'], hueco(1.25), flechas.arriba],
      [...inferiorIzq, espacio, ['AltRight', 'AltGr', 1.25, 'mod'], ['MetaRight', 'Fn', 1.25, 'mod'], ['ContextMenu', 'Menú', 1.25, 'mod'], ['ControlRight', 'Ctrl', 1.25, 'mod'], hueco(0.25), flechas.izq, flechas.abajo, flechas.der],
    ],
  },
};

// Posiciones de cada tecla (en unidades) para dibujarla en 2D o en 3D.
// El Intro ISO ocupa dos filas: se dibuja como una pieza alta que sube a la fila de la Q
// (el hueco de 1,5u que se deja al final de esa fila es su parte de arriba).
export function teclas(formato) {
  const d = DISTRIBUCIONES[formato];
  const lista = [];
  let ancho = 0;
  d.filas.forEach((fila, y) => {
    let x = 0;
    for (const [codigo, rotulo, u, papel] of fila) {
      if (papel) {
        const alta = codigo === 'Enter';
        lista.push({ codigo, rotulo, x: alta ? x - 0.25 : x, y: alta ? y - 1 : y, u: alta ? 1.5 : u, h: alta ? 2 : 1, papel });
      }
      x += u;
    }
    ancho = Math.max(ancho, x);
  });
  return { lista, ancho, alto: d.filas.length, numTeclas: lista.length };
}
