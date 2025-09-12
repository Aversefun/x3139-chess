console.log("X3139 Chess is open source at https://github.com/Aversefun/x3139-chess!")

const board: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("board")!;
const ctx = board.getContext("2d")!;

const canvasLeft = board.offsetLeft + board.clientLeft;
const canvasTop = board.offsetTop + board.clientTop;

ctx.lineWidth = 5;
ctx.strokeStyle = "#000000";
ctx.font = "large Roboto";
ctx.textAlign = "center";

ctx.translate(5, 5);

window.onerror = (ev, source, lineno, colno, err) => {
  alert(`${source}:${lineno}:${colno} - ${err} (stack ${err?.stack})`);
};

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift';
type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> =
  Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>>
  & {
    readonly length: L
    [I: number]: T
    [Symbol.iterator]: () => IterableIterator<T>
  };

type Tile = FixedLengthArray<number, 2>;
type Square = FixedLengthArray<number, 2>;
type CanvasPosition = FixedLengthArray<number, 2>;

enum Piece {
  Pawn = 1,
  Bishop = 2,
  Knight = 3,
  Rook = 4,
  Queen = 5,
  King = 6,
}

enum Color {
  Black = 1,
  White = 2,
}

enum Mode {
  Default = "default",
  Multi = "multi",
  Omni = "omni",
  Chaos = "chaos",
}

namespace Color {
  export function opposite(color: Color): Color {
    switch (color) {
      case Color.Black:
        return Color.White;

      case Color.White:
        return Color.Black;
    }
  }
}

enum MoveDirection {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
  UpLeft = 4,
  UpRight = 5,
  DownLeft = 6,
  DownRight = 7,
}

const all_squares: FixedLengthArray<Square, 64> = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
  [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
  [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
];

const all_tiles: FixedLengthArray<Tile, 16> = [
  [0, 0], [1, 0], [2, 0], [3, 0],
  [0, 1], [1, 1], [2, 1], [3, 1],
  [0, 2], [1, 2], [2, 2], [3, 2],
  [0, 3], [1, 3], [2, 3], [3, 3],
];

function get_location_in_pieces(piece: [Piece, Color]): CanvasPosition {
  let base_loc: CanvasPosition = [0, 0];

  if (Object.is(piece[0], Piece.King)) {
    base_loc = [0, 0];
  } else if (Object.is(piece[0], Piece.Queen)) {
    base_loc = [43, 0];
  } else if (Object.is(piece[0], Piece.Bishop)) {
    base_loc = [90, 0];
  } else if (Object.is(piece[0], Piece.Knight)) {
    base_loc = [135, 0];
  } else if (Object.is(piece[0], Piece.Rook)) {
    base_loc = [182, 0];
  } else if (Object.is(piece[0], Piece.Pawn)) {
    base_loc = [224, 0];
  }

  if (Object.is(piece[1], Color.Black)) {
    base_loc[1] += 45;
  }

  return base_loc;
}

const starting_squares: FixedLengthArray<FixedLengthArray<[Piece, Color] | null, 8>, 8> = [
  [[Piece.Rook, Color.Black], [Piece.Knight, Color.Black], [Piece.Bishop, Color.Black], [Piece.Queen, Color.Black], [Piece.King, Color.Black], [Piece.Bishop, Color.Black], [Piece.Knight, Color.Black], [Piece.Rook, Color.Black]],
  [[Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black]],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [[Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White]],
  [[Piece.Rook, Color.White], [Piece.Knight, Color.White], [Piece.Bishop, Color.White], [Piece.Queen, Color.White], [Piece.King, Color.White], [Piece.Bishop, Color.White], [Piece.Knight, Color.White], [Piece.Rook, Color.White]],
];

var squares = starting_squares;

const starting_moved_pieces: FixedLengthArray<FixedLengthArray<boolean, 8>, 8> = [
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [true, true, true, true, true, true, true, true],
  [true, true, true, true, true, true, true, true],
  [true, true, true, true, true, true, true, true],
  [true, true, true, true, true, true, true, true],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
];

var moved_pieces = starting_moved_pieces;

var empty_location: Tile = [3, 2];

var turn: Color = Color.White;

/**
 * Get the tile of the square.
 * @param sq The base square.
 * @returns The tile of the square.
 */
function get_tile(sq: Square): Tile {
  return [Math.floor(sq[0] / 2), Math.floor(sq[1] / 2)];
}

/**
 * Get the value of a square.
 * @param sq The square.
 * @returns The square's value.
 */
function get_square(sq: Square): [Piece, Color] | null {
  return squares[sq[1]][sq[0]];
}

function get_squares(tile: Tile): FixedLengthArray<FixedLengthArray<[Piece, Color] | null, 2>, 2> {
  const base: Square = [tile[0] * 2, tile[1] * 2];
  return [
    [get_square(base), get_square([base[0] + 1, base[1]])],
    [get_square([base[0], base[1] + 1]), get_square([base[0] + 1, base[1] + 1])],
  ];
}

function set_square(sq: Square, piece: [Piece, Color] | null, mark_piece_moved: boolean = true) {
  squares[sq[1]][sq[0]] = piece;
  if (mark_piece_moved) {
    moved_pieces[sq[1]][sq[0]] = true;
  }
}

function set_squares(tile: Tile, pieces: FixedLengthArray<FixedLengthArray<[Piece, Color] | null, 2>, 2>, mark_piece_moved: boolean = false) {
  const base: Square = [tile[0] * 2, tile[1] * 2];
  set_square(base, pieces[0][0], mark_piece_moved);
  set_square([base[0] + 1, base[1]], pieces[0][1], mark_piece_moved);
  set_square([base[0], base[1] + 1], pieces[1][0], mark_piece_moved);
  set_square([base[0] + 1, base[1] + 1], pieces[1][1], mark_piece_moved);
}

function copy_squares(from: Tile, to: Tile, mark_piece_moved: boolean = false) {
  set_squares(to, get_squares(from), mark_piece_moved);
}

enum Direction {
  Up = 1,
  Down = 2,
  Left = 3,
  Right = 4,
};

/**
 * Get the direction the provided tile can move in, or null if it can't.
 * @param tile The tile to check.
 * @returns The direction the provided tile can move.
 */
function move_dir(tile: Tile): Direction | null {
  const diff: Tile = [tile[0] - empty_location[0], tile[1] - empty_location[1]];
  if (squares_equal(diff, [-1, 0])) {
    return Direction.Right;
  } else if (squares_equal(diff, [0, -1])) {
    return Direction.Down;
  } else if (squares_equal(diff, [1, 0])) {
    return Direction.Left;
  } else if (squares_equal(diff, [0, 1])) {
    return Direction.Up;
  } else {
    return null;
  }
}

/**
 * Move a tile in the provided direction.
 * @param tile The tile to move.
 * @param dir The direction to move the tile in.
 * @returns If it succeeded.
 */
function move_tile(tile: Tile, dir: Direction): boolean {
  if (move_dir(tile) !== dir) {
    return false;
  }

  copy_squares(tile, empty_location, false);
  set_squares(tile, [[null, null], [null, null]], false);

  empty_location = tile;

  return true;
}

function squares_equal(square1: Square, square2: Square): boolean {
  return square1[0] == square2[0] && square1[1] == square2[1];
}

function flip_board() {
  squares.reverse();
  empty_location = [empty_location[0], 3 - empty_location[1]];
}

function find_pieces(predicate: (piece: ([[Piece, Color] | null, Square])) => boolean): ([[Piece, Color], Square] | null)[] {
  return squares.reduce<([Piece, Color] | null)[]>((accumulator, value) => accumulator.concat(value), []).map((v, i) => <[[Piece, Color], Square]>[v, <Square>[i % 8, Math.floor(i / 8)]]).filter(predicate)!;
}

function get_allowed_moves(piece: [Piece, Color], from: Square, ignore_check: boolean = false, only_capturing: boolean = false): Square[] {
  var allowed_movements: Square[] = [];
  var movement_dirs: FixedLengthArray<Square[], 8> = [[], [], [], [], [], [], [], []];

  if (piece === null) {
    return [];
  }

  console.log(from);

  const max_dist = 8;

  switch (piece[0]) {
    case Piece.Pawn:
      const capture_positions: Square[] = [[1, 1], [-1, 1]];
      const enpassant_positions: Square[] = [[-1, -1], [1, -1]];
      switch (piece[1]) {
        case Color.Black:
          if (!only_capturing) {
            if (get_square([from[0], 1 + from[1]]) === null) {
              allowed_movements = [[0, 1]];
              if (!moved_pieces[from[1]][from[0]]) {
                if (get_square([from[0], 2 + from[1]]) === null) {
                  allowed_movements.push([0, 2]);
                }
              }
            }
          }

          for (const pos of capture_positions) {
            if (pos[0] + from[0] >= 8 || pos[1] + from[1] >= 8 || pos[0] + from[0] < 0 || pos[1] + from[1] < 0) {
              continue;
            }
            let sq = get_square([pos[0] + from[0], pos[1] + from[1]]);
            if ((sq !== null && sq[1] === Color.White) || only_capturing) {
              allowed_movements.push(pos);
            }
          }

          for (const pos of enpassant_positions) {
            if (pos[0] + from[0] >= 8 || pos[1] + from[1] >= 8 || pos[0] + from[0] < 0 || pos[1] + from[1] < 0) {
              continue;
            }

            let sq = get_square([pos[0] + from[0], from[1]]);
            if ((sq !== null && sq[1] === Color.White && sq[0] === Piece.Pawn) || only_capturing) {
              allowed_movements.push(pos);
            }
          }

          break;

        case Color.White:
          if (!only_capturing) {
            if (get_square([from[0], from[1] - 1]) === null) {
              allowed_movements = [[0, -1]];
              if (!moved_pieces[from[1]][from[0]]) {
                if (get_square([from[0], from[1] - 2]) === null) {
                  allowed_movements.push([0, -2]);
                }
              }
            }
          }

          for (const pos of capture_positions) {
            if (pos[0] + from[0] >= 8 || pos[1] + from[1] >= 8 || pos[0] + from[0] < 0 || pos[1] + from[1] < 0) {
              continue;
            }
            let sq = get_square([pos[0] + from[0], (-pos[1]) + from[1]]);
            // alert(`${pos} ${sq}`);
            if ((sq !== null && sq[1] === Color.Black && sq[0] === Piece.Pawn) || only_capturing) {
              allowed_movements.push([pos[0], (-pos[1])]);
            }
            // alert(`${allowed_movements}`);
          }

          for (const pos of enpassant_positions) {
            if (pos[0] + from[0] >= 8 || pos[1] + from[1] >= 8 || pos[0] + from[0] < 0 || pos[1] + from[1] < 0) {
              continue;
            }

            let sq = get_square([pos[0] + from[0], from[1]]);
            if ((sq !== null && sq[1] === Color.Black) || only_capturing) {
              allowed_movements.push(pos);
            }
          }

          break;
      }
      break;

    case Piece.Bishop:
      for (let i = 1; i < max_dist; i++) {
        movement_dirs[MoveDirection.DownLeft].push([-i, i]);
        movement_dirs[MoveDirection.DownRight].push([i, i]);
        movement_dirs[MoveDirection.UpLeft].push([-i, -i]);
        movement_dirs[MoveDirection.UpRight].push([i, -i]);
      }
      break;

    case Piece.Knight:
      allowed_movements = [[2, 1], [2, -1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [1, -2], [-1, -2]];
      break;

    case Piece.Rook:
      for (let i = 1; i < max_dist; i++) {
        movement_dirs[MoveDirection.Up].push([0, -i]);
        movement_dirs[MoveDirection.Down].push([0, i]);
        movement_dirs[MoveDirection.Left].push([-i, 0]);
        movement_dirs[MoveDirection.Right].push([i, 0]);
      }
      break;

    case Piece.Queen:
      for (let i = 1; i < max_dist; i++) {
        movement_dirs[MoveDirection.Up].push([0, -i]);
        movement_dirs[MoveDirection.Down].push([0, i]);
        movement_dirs[MoveDirection.Left].push([-i, 0]);
        movement_dirs[MoveDirection.Right].push([i, 0]);
        movement_dirs[MoveDirection.DownLeft].push([-i, i]);
        movement_dirs[MoveDirection.DownRight].push([i, i]);
        movement_dirs[MoveDirection.UpLeft].push([-i, -i]);
        movement_dirs[MoveDirection.UpRight].push([i, -i]);
      }
      break;

    case Piece.King:
      allowed_movements.push([1, 0], [0, 1], [-1, 0], [0, -1]);
      allowed_movements.push([1, 1], [-1, -1], [1, -1], [-1, 1]);

      if (!moved_pieces[from[1]][from[0]]) {
        switch (piece[1]) {
          case Color.White:
            if (!moved_pieces[7][7]) {
              movement_dirs[MoveDirection.Right].push([2, 0]);
            }
            if (!moved_pieces[7][0]) {
              movement_dirs[MoveDirection.Left].push([-2, 0]);
            }
            break;

          case Color.Black:
            if (!moved_pieces[0][7]) {
              movement_dirs[MoveDirection.Right].push([2, 0]);
            }
            if (!moved_pieces[0][0]) {
              movement_dirs[MoveDirection.Left].push([-2, 0]);
            }
            break;
        }
      }
      break;
  }

  for (let dir = 0; dir < movement_dirs.length; dir++) {
    const movement_dir = movement_dirs[dir].map<Square>((v) => [v[0] + from[0], v[1] + from[1]]).filter((v) => v[0] < 8 && v[1] < 8 && v[0] >= 0 && v[1] >= 0);
    movement_dirs[dir] = movement_dir;
    for (let i = 0; i < movement_dir.length; i++) {
      const square = get_square(movement_dir[i]);
      // alert(`square: ${movement_dir[i]} tile: ${get_tile(movement_dir[i])} value: ${square} empty: ${empty_location} is empty: ${squares_equal(get_tile(movement_dir[i]), empty_location)}`);
      if (square === null && !squares_equal(get_tile(movement_dir[i]), empty_location)) {
        continue;
      }
      if (square !== null && square[1] === Color.opposite(piece[1])) {
        movement_dirs[dir].splice(i + 1);
      } else {
        movement_dirs[dir].splice(i);
      }
      break;
    }

    allowed_movements = allowed_movements.concat(movement_dirs[dir].map((v) => [v[0] - from[0], v[1] - from[1]]));
  }

  allowed_movements = allowed_movements
    .map((v) => <Square>[v[0] + from[0], v[1] + from[1]])
    .filter((v) => {
      console.log(v);
      return v[0] < 8 && v[1] < 8 && v[0] >= 0 && v[1] >= 0 && (get_square(v) === null || get_square(v)![1] !== piece[1])
        && !squares_equal(get_tile(v), empty_location);
    })
    .filter((v) => {
      if (ignore_check) {
        return true;
      }
      return !in_check(piece[1], [piece[0], from, v]);
    })
    .filter((v) => get_square(v) === null || get_square(v)![0] !== Piece.King);

  return allowed_movements;
}

function is_move_allowed(piece: [Piece, Color], from: Square, to: Square): boolean {
  return get_allowed_moves(piece, from).filter((v) => squares_equal(v, to)).length > 0
}

function in_check(color: Color, after_move: [Piece, Square, Square] | null = null): boolean {
  var king_square = find_pieces((piece) => piece[0] !== null && piece[0][0] == Piece.King && piece[0][1] == color)[0]![1];

  if (after_move !== null && after_move[0] === Piece.King) {
    king_square = after_move[2]
  }

  const moves =
    find_pieces((piece) => piece[0] !== null && piece[0][1] === Color.opposite(color))
      .map((v) => {
        // alert(`move ${v} to ${get_allowed_moves(v![0], v![1], true)}`);
        return get_allowed_moves(v![0], v![1], true, true);
      })
      .reduce<Square[]>((accumulator, value) => accumulator.concat(value), [])
      .filter((sq) => sq !== null && squares_equal(sq, king_square))
      .filter((sq) => after_move === null || after_move[0] === Piece.King || sq !== after_move[1]);

  // alert(`king on ${king_square} - move ${after_move}, ${moves} could attack`);

  return moves.length > 0;
}

function in_checkmate(color: Color): boolean {
  const moves = find_pieces((piece) => piece[0] !== null && piece[0][1] === color)
    .map((v) => {
      return get_allowed_moves(v![0], v![1], false, true);
    });
  return (in_check(color) && moves
    .reduce<Square[]>((accumulator, value) => accumulator.concat(value), []).length == 0) || moves.length == 0;
}

function get_tile_squares(tile: Tile): FixedLengthArray<Square, 4> {
  const base: Square = [tile[0] * 2, tile[1] * 2];
  return [
    base, [base[0] + 1, base[1]],
    [base[0], base[1] + 1], [base[0] + 1, base[1] + 1]
  ];
}

function tile_to_offset(tile: Tile): CanvasPosition {
  return [tile[0] * 150, tile[1] * 150];
}

function square_to_offset(square: Tile): CanvasPosition {
  return [square[0] * 75, square[1] * 75];
}

function offset_to_square(pos: CanvasPosition): Tile {
  return [Math.floor(pos[0] / 75), Math.floor(pos[1] / 75)];
}

var squareToMove: Square | null = null;
var active = false;
var checkmate = false;
var can_move_all = false;
var move_piece_and_tile = false;

var has_moved_piece = false;
var has_moved_tile = false;

function draw_tile_outline(tile: Tile) {
  let pos = tile_to_offset(tile);
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(pos[0], pos[1], 150, 150);
}

function draw_square_background(square: Square, color: Color, set_white: boolean) {
  let pos = square_to_offset(square);
  if (color === Color.Black) {
    ctx.fillStyle = "#122054";
  } else {
    ctx.fillStyle = "#d8d5c9";
  }
  if (set_white) {
    ctx.fillStyle = "#ffffff";
  }
  ctx.fillRect(pos[0], pos[1], 75, 75);
}

function draw_piece(square: Square, piece: [Piece, Color]) {
  const pieces_image: HTMLImageElement = <HTMLImageElement>document.getElementById("pieces")!;

  let pos = square_to_offset(square);
  let img_offset = get_location_in_pieces(piece);
  ctx.drawImage(pieces_image, img_offset[0], img_offset[1], 45, 45, pos[0] + 7.5, pos[1] + 7.5, 60, 60);
}

var highlight: Square | null = null;
var indicators: Square[] = [];
var show_tile_indicator = false;

function draw_highlight(square: Square) {
  let pos = square_to_offset(square);

  ctx.strokeStyle = "#1f38c3ff";
  ctx.strokeRect(pos[0], pos[1], 75, 75);
}

function draw_indicator(square: Square) {
  let pos = square_to_offset(square);

  ctx.strokeStyle = "#981b1bff";
  ctx.strokeRect(pos[0], pos[1], 75, 75);
}

function draw_tile_indicator(tile: Tile) {
  let pos = tile_to_offset(tile);

  ctx.strokeStyle = "#981b1bff";
  ctx.strokeRect(pos[0], pos[1], 150, 150);
}

function draw_turn() {
  ctx.strokeStyle = "#808080";
  if (!active) {
    ctx.fillStyle = "#b62626";
  } else if (turn === Color.Black) {
    ctx.fillStyle = "#1f1f1f";
  } else {
    ctx.fillStyle = "#e0e0e0";
  }

  ctx.fillRect(635, 275, 50, 50);
  ctx.strokeRect(635, 275, 50, 50);

  ctx.fillStyle = ctx.strokeStyle;
  if (checkmate) {
    ctx.fillText("Checkmate", 660, 350, 100);
  } else if (!active) {
    ctx.fillText("Start", 660, 350, 100);
    ctx.fillText("the game", 660, 365, 100);
  } else if (turn === Color.Black) {
    ctx.fillText("Black", 660, 350, 100);
    ctx.fillText("to move", 660, 365, 100);
  } else {
    ctx.fillText("White", 660, 350, 100);
    ctx.fillText("to move", 660, 365, 100);
  }
}

function draw_all() {
  for (const square of all_squares) {
    const i = square[0] + square[1];
    let color = Color.Black;
    if (i % 2 == 0) {
      color = Color.White;
    }
    const tile = get_tile(square);

    draw_square_background(square, color, squares_equal(tile, empty_location));

    const piece = get_square(square);

    if (piece !== null) {
      draw_piece(square, piece);
    }
  }

  for (const tile of all_tiles) {
    if (squares_equal(tile, empty_location)) {
      continue;
    }
    draw_tile_outline(tile);
  }

  if (!!highlight) {
    draw_highlight(highlight);
  }

  for (const indicator of indicators) {
    draw_indicator(indicator);
  }

  if (!!show_tile_indicator) {
    draw_tile_indicator(empty_location);
  }

  draw_turn();
}

function tick(delta: number) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 700, 600);
  draw_all();
  if (!active) {
    ctx.fillStyle = "#91919171";
    ctx.fillRect(-5, -5, 610, 610);
  }
  requestAnimationFrame(tick);
}

function switch_turn() {
  turn = Color.opposite(turn);
  has_moved_piece = false;
  has_moved_tile = false;
  
  reset_indicators();

  if (checkmate) {
    turn = Color.opposite(turn);
    (<HTMLButtonElement>document.getElementById("start")!).disabled = false;
    (<HTMLSelectElement>document.getElementById("mode")!).disabled = false;
  }
}

function reset_indicators() {
  indicators = [];
  show_tile_indicator = false;
  highlight = null;

  if (in_checkmate(turn)) {
    checkmate = true;
  }
}

tick(0);
board.addEventListener('click', function (event) {
  if (!active || checkmate) {
    return;
  }
  const square = offset_to_square([Math.floor(event.pageX - canvasLeft), Math.floor(event.pageY - canvasTop)]);
  if (square[0] > 7 || square[1] > 7) {
    return;
  }
  const tile = get_tile(square);

  if (squareToMove === null && ((get_square(square) !== null && get_square(square)![1] == turn && ((!has_moved_piece && move_piece_and_tile) || !move_piece_and_tile)) || ((move_dir(tile) && ((move_piece_and_tile && !has_moved_tile) || !move_piece_and_tile)) && (get_squares(tile).some((v) => v.some((v) => v !== null && v[1] === turn)) || can_move_all)))) {
    squareToMove = square;
    highlight = square;
    if (get_square(square) !== null && !has_moved_piece) {
      indicators = get_allowed_moves(get_square(square)!, square);
    }
    if (!has_moved_tile) {
      show_tile_indicator = !!move_dir(tile);
    }
  } else if (squareToMove !== null && squares_equal(square, squareToMove)) {
    squareToMove = null;
    reset_indicators();
  } else if (squareToMove !== null && !squares_equal(tile, empty_location) && ((!has_moved_piece && move_piece_and_tile) || !move_piece_and_tile) && is_move_allowed(get_square(squareToMove)!, squareToMove, square)) {
    const piece = get_square(squareToMove);

    // alert(`from ${squareToMove} to ${square} (might passant over ${[squareToMove[0]-1, squareToMove[1]]} or ${[squareToMove[0]+1, squareToMove[1]]})`);

    if (piece![0] === Piece.King) {
      switch (turn) {
        case Color.White:
          if (squares_equal(squareToMove, [4, 7]) && squares_equal(square, [6, 7])) {
            set_square([squareToMove[0] + 1, squareToMove[1]], [Piece.Rook, Color.White]);
            set_square([7, 7], null);
          } else if (squares_equal(squareToMove, [4, 7]) && squares_equal(square, [0, 7])) {
            set_square([squareToMove[0] - 1, squareToMove[1]], [Piece.Rook, Color.White]);
            set_square([0, 7], null);
          }
          break;

        case Color.Black:
          if (squares_equal(squareToMove, [4, 0]) && squares_equal(square, [6, 0])) {
            set_square([squareToMove[0] + 1, squareToMove[1]], [Piece.Rook, Color.Black]);
            set_square([7, 0], null);
          } else if (squares_equal(squareToMove, [4, 0]) && squares_equal(square, [0, 0])) {
            set_square([squareToMove[0] - 1, squareToMove[1]], [Piece.Rook, Color.Black]);
            set_square([0, 0], null);
          }
          break;
      }
    } else if (piece![0] === Piece.Pawn) {
      if (squareToMove[0] > 0) {
        const left_passant = get_square([squareToMove[0] - 1, squareToMove[1]]);
        if (left_passant !== null && left_passant[1] === Color.opposite(turn) && squares_equal(square, [squareToMove[0] - 1, squareToMove[1] - 1])) {
          set_square([squareToMove[0] - 1, squareToMove[1]], null);
        }
      }

      if (squareToMove[0] < 7) {
        const right_passant = get_square([squareToMove[0] + 1, squareToMove[1]]);
        if (right_passant !== null && right_passant[1] === Color.opposite(turn) && squares_equal(square, [squareToMove[0] + 1, squareToMove[1] - 1])) {
          set_square([squareToMove[0] + 1, squareToMove[1]], null);
        }
      }
    }

    set_square(square, piece);
    set_square(squareToMove, null);

    squareToMove = null;
    has_moved_piece = true;
    reset_indicators();
    if ((move_piece_and_tile && has_moved_tile) || !move_piece_and_tile) {
      switch_turn();
    }
  } else if (squareToMove !== null && move_dir(get_tile(squareToMove)) && squares_equal(tile, empty_location) && ((!has_moved_tile && move_piece_and_tile) || !move_piece_and_tile)) {
    const old_empty = empty_location;
    move_tile(get_tile(squareToMove), move_dir(get_tile(squareToMove))!);
    if (in_check(turn)) {
      move_tile(old_empty, move_dir(old_empty)!);
      return;
    }
    squareToMove = null;
    reset_indicators();
    has_moved_tile = true;
    if ((move_piece_and_tile && has_moved_piece) || !move_piece_and_tile) {
      switch_turn();
    }
  }
}, false);

document.getElementById("start")!.addEventListener("click", () => {
  squares = starting_squares;
  moved_pieces = starting_moved_pieces;
  
  const modeElement = <HTMLSelectElement>document.getElementById("mode")!;
  const mode = <Mode>modeElement.value;
  console.log(mode);

  switch (mode) {
    case Mode.Default:
      break;

    case Mode.Multi:
      move_piece_and_tile = true;
      break;

    case Mode.Omni:
      can_move_all = true;
      break;

    case Mode.Chaos:
      can_move_all = true;
      move_piece_and_tile = true;
      break;
  }

  (<HTMLButtonElement>document.getElementById("start")!).disabled = true;
  modeElement.disabled = true;
  active = true;
  ctx.clearRect(-5, -5, 710, 610);
});
