// Shared turtle graphics for Python pages — a `turtle` module that runs inside Pyodide, and a
// canvas under the editor that draws what it did.
//
// Python's own turtle needs a Tk window, which the browser doesn't have. This module installs
// a stand-in under the same name: student code `import turtle` / `t = turtle.Turtle()` /
// `t.forward(100)` runs as normal Python, and every line the turtle draws is recorded with its
// colour, width and the trace step it was drawn on. Wrong calls fail as they do in Python (an
// unknown colour → TurtleGraphicsError: bad color string, a move given text → TypeError).
//
// Usage (a module script):
//   import { attachTurtle, turtleReady, readDrawing } from '../../../turtle-canvas.js';
//   attachTurtle(document.getElementById('i_editor'), { title: 'Beacon display', look: 'space' });
//   await turtleReady;                    // before the first run that imports turtle
//   const run = await runPython(code, { traceLines: true });
//   run.drawing = readDrawing();          // straight after the run, before any other run
//
// attachTurtle puts a screen under the editor's output and listens to code-editor.js's run
// events: with stepThrough each line appears as the replay reaches the line that drew it
// ('exec-step'); otherwise the whole drawing appears when the run's output does
// ('exec-done'). A run that carries `drawing` (set by the page, e.g. a check that ran several
// tests and replays one) is drawn from that; any other run is read from Python at its first
// event, which is straight after it ran.
//
// A drawing is plain JSON (see _rq_dump below):
//   { used, segs: [[x1, y1, x2, y2, colour, width, step]], fills: [[[x, y]…], colour, step],
//     dots: [[x, y, size, colour, step]], texts: [[x, y, text, colour, step]],
//     poses: [[step, x, y, heading, shown, spin]], bg }
// (spin is the heading without % 360: left(270) and right(90) end at the same heading, but the
// screen turns the turtle the way the code did.)
// Turtle coordinates: (0, 0) in the middle, y upwards, heading 0 = east, degrees anticlockwise.
// Colours are stored as typed, in lower case without spaces ("red", "#ff8800").

import { preload, pyEval } from './pyodide-runner.js';

const TURTLE_PY = String.raw`
import math as _m, json as _j
import __main__ as _main

class TurtleGraphicsError(Exception):
    pass

class Terminator(Exception):
    pass

_NAMES = set('''black white red green blue yellow orange purple pink cyan magenta brown grey gray
gold silver navy lime violet indigo turquoise maroon olive teal coral salmon crimson orchid tan khaki
beige lavender aqua fuchsia chocolate darkblue darkgreen darkred lightblue lightgreen skyblue
royalblue hotpink deeppink tomato orangered darkorange forestgreen seagreen springgreen limegreen
yellowgreen chartreuse steelblue slateblue darkviolet plum firebrick goldenrod sienna peru wheat
ivory snow azure mintcream lightgrey lightgray darkgrey darkgray dimgray dimgrey lightpink
lightyellow lightcyan midnightblue dodgerblue deepskyblue cornflowerblue mediumpurple darkcyan
darkmagenta darkslategray darkslategrey slategray slategrey'''.split())
_HEX = set('0123456789abcdef')
_MAX = 4000          # lines kept per run; a runaway loop keeps moving but stops recording
_log = {'token': None}
_state = {'default': None, 'screen': None, 'mode': 1.0}

def _reset():
    _log.clear()
    _log.update(token=id(_main.__dict__.get('_rg')), segs=[], fills=[], dots=[], texts=[], poses=[], bg='white')
    _state['default'] = None
    _state['screen'] = None
    _state['mode'] = 1.0

# A new run (pyodide-runner.js makes a fresh _rg for every run) starts a new drawing.
def _sync():
    if _log['token'] != id(_main.__dict__.get('_rg')):
        _reset()

def _step():
    s = _main.__dict__.get('_rq_steps')
    return s[0] if isinstance(s, list) and s else 0

def _r(v):
    return round(v, 3)

def _colour(args):
    if len(args) == 1:
        c = args[0]
    elif len(args) == 3:
        c = tuple(args)
    else:
        raise TurtleGraphicsError('bad color arguments: %s' % (args,))
    if isinstance(c, str):
        s = c.strip().lower().replace(' ', '')
        if s in _NAMES:
            return s
        if s.startswith('#') and len(s) in (4, 7) and all(ch in _HEX for ch in s[1:]):
            return s
        raise TurtleGraphicsError('bad color string: %s' % c)
    if isinstance(c, (tuple, list)) and len(c) == 3:
        top = _state['mode']
        if not all(isinstance(v, (int, float)) and 0 <= v <= top for v in c):
            raise TurtleGraphicsError('bad color sequence: %s' % (c,))
        return '#%02x%02x%02x' % tuple(int(round(v * 255 / top)) for v in c)
    raise TurtleGraphicsError('bad color string: %s' % (c,))

# Python's turtle multiplies the distance by a vector, so text fails the same way.
def _num(v):
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        if isinstance(v, str):
            raise TypeError("can't multiply sequence by non-int of type 'float'")
        raise TypeError("unsupported operand type(s) for *: 'Vec2D' and '%s'" % type(v).__name__)
    return float(v)

class _Screen:
    def bgcolor(self, *args):
        _sync()
        if not args:
            return _log['bg']
        _log['bg'] = _colour(args)
    def colormode(self, cmode=None):
        if cmode is None:
            return _state['mode']
        if cmode not in (1, 1.0, 255):
            raise TurtleGraphicsError('No colormode %s' % cmode)
        _state['mode'] = 255 if cmode == 255 else 1.0
    def title(self, *a, **k): pass
    def setup(self, *a, **k): pass
    def screensize(self, *a, **k): pass
    def tracer(self, *a, **k): pass
    def update(self): pass
    def delay(self, *a, **k): pass
    def listen(self, *a, **k): pass
    def onkey(self, *a, **k): pass
    def onclick(self, *a, **k): pass
    def ontimer(self, *a, **k): pass
    def exitonclick(self): pass
    def mainloop(self): pass
    def done(self): pass
    def bye(self): pass
    def clear(self):
        _sync()
        for k in ('segs', 'fills', 'dots', 'texts'):
            _log[k].clear()
    def window_width(self): return 640
    def window_height(self): return 480

def Screen():
    _sync()
    if _state['screen'] is None:
        _state['screen'] = _Screen()
    return _state['screen']

class Turtle:
    def __init__(self, shape='classic', undobuffersize=1000, visible=True):
        _sync()
        self._x = 0.0
        self._y = 0.0
        self._h = 0.0
        self._spin = 0.0   # heading without the % 360, so the screen knows which way it turned
        self._down = True
        self._pc = 'black'
        self._fc = 'black'
        self._w = 1
        self._shown = bool(visible)
        self._fill = None
        self._pose()

    def __repr__(self):
        return '<turtle.Turtle object>'

    def _pose(self):
        if len(_log['poses']) < _MAX:
            _log['poses'].append([_step(), _r(self._x), _r(self._y), _r(self._h % 360), self._shown, _r(self._spin)])

    def _move_to(self, x, y):
        _sync()
        if self._down and (x != self._x or y != self._y) and len(_log['segs']) < _MAX:
            _log['segs'].append([_r(self._x), _r(self._y), _r(x), _r(y), self._pc, self._w, _step()])
        self._x, self._y = x, y
        if self._fill is not None:
            self._fill.append([_r(x), _r(y)])
        self._pose()

    def _turn(self, a):
        _sync()
        self._h = (self._h + a) % 360
        self._spin += a
        self._pose()

    def forward(self, distance):
        d = _num(distance)
        a = _m.radians(self._h)
        self._move_to(self._x + d * _m.cos(a), self._y + d * _m.sin(a))
    fd = forward

    def backward(self, distance):
        self.forward(-_num(distance))
    back = bk = backward

    def left(self, angle):
        self._turn(_num(angle))
    lt = left

    def right(self, angle):
        self._turn(-_num(angle))
    rt = right

    def goto(self, x, y=None):
        if y is None:
            x, y = x
        self._move_to(_num(x), _num(y))
    setpos = setposition = goto

    def setx(self, x):
        self._move_to(_num(x), self._y)

    def sety(self, y):
        self._move_to(self._x, _num(y))

    def setheading(self, to_angle):
        _sync()
        to = _num(to_angle) % 360
        self._spin += (to - self._h + 180) % 360 - 180   # the short way round, as Python's turtle turns
        self._h = to
        self._pose()
    seth = setheading

    def home(self):
        self._move_to(0.0, 0.0)
        self.setheading(0)

    def circle(self, radius, extent=None, steps=None):
        radius = _num(radius)
        extent = 360.0 if extent is None else _num(extent)
        if steps is None:
            frac = abs(extent) / 360
            steps = 1 + int(min(11 + abs(radius) / 6.0, 59.0) * frac)
        w = 1.0 * extent / steps
        w2 = 0.5 * w
        l = 2.0 * radius * _m.sin(_m.radians(w2))
        if radius < 0:
            l, w, w2 = -l, -w, -w2
        self._turn(w2)
        for _ in range(steps):
            self.forward(l)
            self._turn(w)
        self._turn(-w2)

    def dot(self, size=None, *color):
        _sync()
        c = _colour(color) if color else self._pc
        s = max(self._w + 4, 2 * self._w) if size is None else _num(size)
        _log['dots'].append([_r(self._x), _r(self._y), s, c, _step()])

    def write(self, arg, move=False, align='left', font=None):
        _sync()
        _log['texts'].append([_r(self._x), _r(self._y), str(arg), self._pc, _step()])

    def penup(self):
        self._down = False
    pu = up = penup

    def pendown(self):
        self._down = True
    pd = down = pendown

    def isdown(self):
        return self._down

    def pensize(self, width=None):
        if width is None:
            return self._w
        self._w = _num(width)
    width = pensize

    def pencolor(self, *args):
        if not args:
            return self._pc
        self._pc = _colour(args)

    def fillcolor(self, *args):
        if not args:
            return self._fc
        self._fc = _colour(args)

    def color(self, *args):
        if not args:
            return (self._pc, self._fc)
        if len(args) == 2:
            self._pc, self._fc = _colour(args[:1]), _colour(args[1:])
        else:
            self._pc = self._fc = _colour(args)

    def begin_fill(self):
        self._fill = [[_r(self._x), _r(self._y)]]

    def end_fill(self):
        _sync()
        if self._fill is not None and len(self._fill) > 2:
            _log['fills'].append([self._fill, self._fc, _step()])
        self._fill = None

    def filling(self):
        return self._fill is not None

    def hideturtle(self):
        self._shown = False
        self._pose()
    ht = hideturtle

    def showturtle(self):
        self._shown = True
        self._pose()
    st = showturtle

    def isvisible(self):
        return self._shown

    def position(self):
        return (self._x, self._y)
    pos = position

    def xcor(self):
        return self._x

    def ycor(self):
        return self._y

    def heading(self):
        return self._h

    def distance(self, x, y=None):
        if y is None:
            x, y = x
        return _m.hypot(_num(x) - self._x, _num(y) - self._y)

    def speed(self, speed=None):
        return 3 if speed is None else None

    def shape(self, name=None):
        return 'classic' if name is None else None

    def shapesize(self, *a, **k): pass
    turtlesize = shapesize

    def stamp(self):
        return 0

    def clear(self):
        Screen().clear()

    def reset(self):
        Screen().clear()
        self.__init__()

    def getscreen(self):
        return Screen()

Pen = RawTurtle = Turtle

def _default():
    _sync()
    if _state['default'] is None:
        _state['default'] = Turtle()
    return _state['default']

def _forward(name):
    def call(*args, **kwargs):
        return getattr(_default(), name)(*args, **kwargs)
    call.__name__ = name
    return call

for _n in ('forward fd backward back bk left lt right rt goto setpos setposition setx sety '
           'setheading seth home circle dot write penup pu up pendown pd down isdown pensize width '
           'pencolor fillcolor color begin_fill end_fill filling hideturtle ht showturtle st '
           'isvisible position pos xcor ycor heading distance speed shape shapesize turtlesize '
           'stamp clear reset').split():
    globals()[_n] = _forward(_n)

def _screen(name):
    def call(*args, **kwargs):
        return getattr(Screen(), name)(*args, **kwargs)
    call.__name__ = name
    return call

for _n in 'bgcolor colormode title setup screensize tracer update delay listen onkey onclick ontimer exitonclick mainloop done bye'.split():
    globals()[_n] = _screen(_n)

def _rq_dump():
    used = _log.get('token') == id(_main.__dict__.get('_rg'))
    if not used:
        return _j.dumps({'used': False, 'segs': [], 'fills': [], 'dots': [], 'texts': [], 'poses': [], 'bg': 'white'})
    return _j.dumps({'used': True, **{k: _log[k] for k in ('segs', 'fills', 'dots', 'texts', 'poses', 'bg')}})
`;

const INSTALL_PY = `
import sys as _sys, types as _types
_tm = _types.ModuleType('turtle')
_tm.__file__ = 'turtle.py'
exec(compile(${JSON.stringify(TURTLE_PY)}, 'turtle.py', 'exec'), _tm.__dict__)
_sys.modules['turtle'] = _tm
del _tm
`;

// Resolves once `import turtle` gets this module. Await it before the first run.
export const turtleReady = preload().then(() => { pyEval(INSTALL_PY); });

const EMPTY = { used: false, segs: [], fills: [], dots: [], texts: [], poses: [], bg: 'white' };

// What the most recent run drew (call it straight after the run).
export function readDrawing() {
  try {
    const json = pyEval('__import__("sys").modules["turtle"]._rq_dump()');
    return json ? JSON.parse(json) : EMPTY;
  } catch { return EMPTY; }
}

// ── The screen ───────────────────────────────────────────────────────────────

const VIEW_W = 440, VIEW_H = 300;   // turtle units shown at scale 1: x −220…220, y −150…150

function injectStyles() {
  if (document.getElementById('turtle-canvas-styles')) return;
  const st = document.createElement('style');
  st.id = 'turtle-canvas-styles';
  st.textContent = `
    .turtle-screen { border-top: 1px solid var(--line, #33404d); background: #0d1117; }
    .turtle-screen-body { padding: 0.6rem; display: flex; justify-content: center; }
    .turtle-screen canvas { max-width: 480px; border-radius: 6px; }
    .turtle-screen-head { display: flex; justify-content: space-between; gap: 0.5rem; align-items: center; padding: 0.35rem 0.7rem;
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; color: #cbd5e1; background: #111821; }
    .turtle-screen-head .ts-note { font-weight: 400; color: #94a3b8; }
    .turtle-screen { font-family: 'Segoe UI', system-ui, sans-serif; }
    .turtle-screen-head > span:first-child { white-space: nowrap; }
    .turtle-screen-head .ts-note { text-align: right; }
    .turtle-screen canvas { display: block; width: 100%; height: auto; aspect-ratio: ${VIEW_W} / ${VIEW_H}; background: #02040a; }
    /* In the output panel's place (a program with no print or input): the console's own text hides */
    .output-panel.turtle-only > .output-header, .output-panel.turtle-only > .output-content { display: none; }
    .output-panel > .turtle-screen { border: 1px solid var(--line, #33404d); border-radius: 6px; overflow: hidden; }
    .output-panel > .turtle-screen .turtle-screen-body { padding: 0; }
    .output-panel > .turtle-screen canvas { max-width: none; border-radius: 0; }
  `;
  document.head.appendChild(st);
}

// Bounds of everything a drawing puts on screen (and the start point), so the view can zoom out
// to fit it. The whole run's drawing is used, so the view doesn't jump as lines appear.
function bounds(d) {
  let x0 = -1, x1 = 1, y0 = -1, y1 = 1;
  const add = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  for (const s of d.segs) { add(s[0], s[1]); add(s[2], s[3]); }
  for (const p of d.poses) add(p[1], p[2]);
  for (const t of d.dots) add(t[0], t[1]);
  return { x0, x1, y0, y1 };
}

function scaleFor(d) {
  const b = bounds(d);
  const need = Math.max(Math.abs(b.x0), Math.abs(b.x1)) * 2 + 30;
  const needY = Math.max(Math.abs(b.y0), Math.abs(b.y1)) * 2 + 30;
  return Math.min(1, VIEW_W / need, VIEW_H / needY);
}

// Looks: 'paper' is Python's own turtle window (white, lines as drawn). 'space' is a station
// screen: deep space with stars and faint range rings round the start point, glowing lines.
// On 'space', black (the turtle's default pen) can't be seen, so it's drawn in signal green;
// paintDrawing reports that so the screen can say so. A background the student set with
// bgcolor() is always used as it is. The checks never look at this picture, only at the drawing.
const SIGNAL_GREEN = '#5cff8f';

function paintSpace(ctx, k) {
  const w = VIEW_W * k, h = VIEW_H * k;
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
  g.addColorStop(0, '#0c1630'); g.addColorStop(1, '#02040a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(226,232,240,${(0.15 + rnd() * 0.6).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, (0.3 + rnd() * 0.9) * k, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(92,255,143,0.09)'; ctx.lineWidth = 1 * k;
  for (const r of [60, 120, 180]) { ctx.beginPath(); ctx.arc(w / 2, h / 2, r * k, 0, Math.PI * 2); ctx.stroke(); }
}

// Draw `d` as it stood after trace step `upTo` (Infinity = all of it). Returns how many lines
// are on screen, and whether any black line was shown in green.
// `heading` (degrees) draws the turtle pointing that way instead of along its pose, for a turn
// that is being animated.
export function paintDrawing(canvas, d, upTo = Infinity, { look = 'paper', heading } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || VIEW_W;
  const px = Math.round(cssW * dpr);
  if (canvas.width !== px) { canvas.width = px; canvas.height = Math.round(px * VIEW_H / VIEW_W); }
  const ctx = canvas.getContext('2d');
  const k = canvas.width / VIEW_W;   // device pixels per view unit
  const s = scaleFor(d);
  const X = x => (VIEW_W / 2 + x * s) * k, Y = y => (VIEW_H / 2 - y * s) * k;
  const ownBg = d.bg && d.bg !== 'white';
  const space = look === 'space' && !ownBg;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowBlur = 0;
  if (space) paintSpace(ctx, k);
  else { ctx.fillStyle = d.bg || 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  // faint axes through the start point
  ctx.strokeStyle = space ? 'rgba(92,255,143,0.12)' : 'rgba(100,116,139,0.18)'; ctx.lineWidth = 1 * k;
  ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(canvas.width, Y(0)); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), canvas.height); ctx.stroke();
  let greened = false;
  const ink = c => { if (space && (c === 'black' || c === '#000' || c === '#000000')) { greened = true; return SIGNAL_GREEN; } return c; };
  const shown = item => item[item.length - 1] <= upTo;
  for (const [pts, c] of d.fills.filter(shown)) {
    ctx.fillStyle = ink(c); ctx.globalAlpha = space ? 0.55 : 1; ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const segs = d.segs.filter(shown);
  // on 'space', each line twice: a soft glow under it, then the line itself
  for (const pass of space ? ['glow', 'line'] : ['line']) {
    for (const [x1, y1, x2, y2, c, w] of segs) {
      const col = ink(c);
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, w * s) * k * (pass === 'glow' ? 2.2 : 1);
      ctx.shadowColor = col; ctx.shadowBlur = pass === 'glow' ? 10 * k : 0;
      ctx.globalAlpha = pass === 'glow' ? 0.45 : 1;
      ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke();
    }
  }
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  for (const [x, y, size, c] of d.dots.filter(shown)) {
    ctx.fillStyle = ink(c); ctx.beginPath(); ctx.arc(X(x), Y(y), Math.max(1, size * s / 2) * k, 0, Math.PI * 2); ctx.fill();
  }
  ctx.font = `${12 * k}px 'Segoe UI', system-ui, sans-serif`;
  for (const [x, y, text, c] of d.texts.filter(shown)) { ctx.fillStyle = ink(c); ctx.fillText(text, X(x), Y(y)); }
  // the turtle: Python's "classic" arrow, pointing along its heading
  const pose = poseAt(d, upTo);
  if (pose && pose[4]) {
    const [, x, y, h0] = pose, h = heading ?? h0, a = -h * Math.PI / 180, r = 9 * k;
    ctx.save(); ctx.translate(X(x), Y(y)); ctx.rotate(a);
    ctx.fillStyle = space ? '#e2f8ea' : '#0f172a'; ctx.strokeStyle = space ? SIGNAL_GREEN : '#fff'; ctx.lineWidth = 1.2 * k;
    if (space) { ctx.shadowColor = SIGNAL_GREEN; ctx.shadowBlur = 8 * k; }
    ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r * 0.7, r * 0.6); ctx.lineTo(-r * 0.35, 0); ctx.lineTo(-r * 0.7, -r * 0.6); ctx.closePath();
    ctx.fill(); ctx.stroke(); ctx.restore();
  }
  return { lines: segs.length, greened };
}

// The turtle's pose after trace step `upTo`: [step, x, y, heading, shown, spin], or null.
function poseAt(d, upTo) {
  return d.poses.filter(p => p[0] <= upTo).pop() || (d.used ? null : [0, 0, 0, 0, true, 0]);
}

// A turn is animated rather than jumped: the turtle swings round the way the code turned it,
// TURN_MS for a quarter turn (longer turns take a little longer, never more than TURN_MAX_MS),
// so it is done well before the next step-through line. Not with reduced motion.
const TURN_MS = 260, TURN_MAX_MS = 420;
const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const ease = t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

const linesNote = n => n === 1 ? '1 line drawn' : `${n} lines drawn`;

// Does this code use the console? print() or input() outside a comment.
export function usesConsole(code) {
  return /\b(print|input)\s*\(/.test(String(code).replace(/#.*$/gm, ''));
}

// Put a turtle screen beside `ta`'s code (code-editor.js must have set it up already).
// A program that only draws gets the screen in the output panel's place (the step-through
// status and memory view stay). A program with print() or input(), or a run that printed
// something or failed, keeps the console and gets the screen full width under the editor row.
// Decided when a run starts (from the code) and when it ends (from what it did), never while
// typing, so the layout doesn't jump about mid-edit.
// look: 'paper' (Python's white window, the default) or 'space' (see paintDrawing).
// Returns { show(drawing) } for drawing something by hand.
export function attachTurtle(ta, { title = 'Turtle screen', look = 'paper' } = {}) {
  injectStyles();
  const wrap = document.createElement('div');
  wrap.className = 'turtle-screen';
  wrap.innerHTML = `<div class="turtle-screen-head"><span>🐢 ${title}</span><span class="ts-note">Press ▶ Run code to draw</span></div>`
    + `<div class="turtle-screen-body"><canvas role="img" aria-label="${title}: what the turtle drew"></canvas></div>`;
  const row = ta.closest('.editor-wrap');
  const panel = row?.querySelector('.output-panel');
  const place = consoleNeeded => {
    if (!panel || consoleNeeded) {
      panel?.classList.remove('turtle-only');
      if (wrap.previousElementSibling !== (row || ta)) (row || ta.closest('.code-checker') || ta).after(wrap);
    } else {
      panel.classList.add('turtle-only');
      const content = panel.querySelector('.output-content');
      if (wrap.nextElementSibling !== content) content.before(wrap);
    }
  };
  place(usesConsole(ta.value));
  setTimeout(() => place(usesConsole(ta.value)), 0);   // after any saved code is restored
  const canvas = wrap.querySelector('canvas');
  const note = wrap.querySelector('.ts-note');
  let current = EMPTY, shownUpTo = Infinity;
  let turning = null;   // { frame, to: pose } while a turn is being animated
  const paint = heading => paintDrawing(canvas, current, shownUpTo, { look, heading });
  const show = (d, upTo = Infinity) => {
    const before = d === current ? poseAt(current, shownUpTo) : null;
    const after = poseAt(d, upTo);
    current = d; shownUpTo = upTo;
    const same = (p, q) => p && q && p[1] === q[1] && p[2] === q[2] && (p[5] ?? p[3]) === (q[5] ?? q[3]);
    if (turning && !same(turning.to, after)) { cancelAnimationFrame(turning.frame); turning = null; }
    let lines, greened;
    if (turning) ({ lines, greened } = paint(turning.at));
    else {
      const from = before?.[5] ?? before?.[3], to = after?.[5] ?? after?.[3];
      const turns = before && after && after[4] && before[1] === after[1] && before[2] === after[2]
        && from !== to && !reducedMotion();
      ({ lines, greened } = paint(turns ? from : undefined));
      if (turns) {
        const ms = Math.min(TURN_MAX_MS, TURN_MS * Math.max(1, Math.sqrt(Math.abs(to - from) / 90)));
        const t0 = performance.now();
        const tick = now => {
          const t = Math.min(1, Math.max(0, (now - t0) / ms));
          turning.at = from + (to - from) * ease(t);
          paint(t < 1 ? turning.at : undefined);
          if (t < 1) turning.frame = requestAnimationFrame(tick); else turning = null;
        };
        turning = { to: after, at: from, frame: requestAnimationFrame(tick) };
      }
    }
    note.textContent = !d.used ? 'This run didn\'t use the turtle'
      : linesNote(lines) + (greened ? ' · black shows as green here' : '');
    canvas.setAttribute('aria-label', `${title}: ${d.used ? linesNote(lines) : 'nothing drawn'}`);
  };
  const drawingOf = run => run.drawing || (run.drawing = readDrawing());
  ta.addEventListener('exec-step', e => show(drawingOf(e.detail.run), e.detail.index + 1));
  ta.addEventListener('exec-start', () => place(usesConsole(ta.value)));
  ta.addEventListener('exec-done', e => {
    const run = e.detail.run;
    if (!run.ok || /\S/.test(run.output || '') && run.output.trim() !== '(no output)' || usesConsole(ta.value)) place(true);
    show(drawingOf(run));
  });
  paintDrawing(canvas, EMPTY, Infinity, { look });
  window.addEventListener('resize', () => { if (!turning) paint(); });
  return { show };
}
