"use strict";
const board = document.getElementById("board");
const ctx = board.getContext("2d");
const canvasLeft = board.offsetLeft + board.clientLeft;
const canvasTop = board.offsetTop + board.clientTop;
ctx.lineWidth = 5;
ctx.strokeStyle = "#000000";
window.onerror = (ev, source, lineno, colno, err) => {
    alert(`${source}:${lineno}:${colno} - ${err} (stack ${err === null || err === void 0 ? void 0 : err.stack})`);
};
var Piece;
(function (Piece) {
    Piece[Piece["Pawn"] = 1] = "Pawn";
    Piece[Piece["Bishop"] = 2] = "Bishop";
    Piece[Piece["Knight"] = 3] = "Knight";
    Piece[Piece["Rook"] = 4] = "Rook";
    Piece[Piece["Queen"] = 5] = "Queen";
    Piece[Piece["King"] = 6] = "King";
})(Piece || (Piece = {}));
var Color;
(function (Color) {
    Color[Color["Black"] = 1] = "Black";
    Color[Color["White"] = 2] = "White";
})(Color || (Color = {}));
(function (Color) {
    function opposite(color) {
        switch (color) {
            case Color.Black:
                return Color.White;
            case Color.White:
                return Color.Black;
        }
    }
    Color.opposite = opposite;
})(Color || (Color = {}));
const all_squares = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
    [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
    [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
    [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
    [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
];
const all_tiles = [
    [0, 0], [1, 0], [2, 0], [3, 0],
    [0, 1], [1, 1], [2, 1], [3, 1],
    [0, 2], [1, 2], [2, 2], [3, 2],
    [0, 3], [1, 3], [2, 3], [3, 3],
];
function get_location_in_pieces(piece) {
    let base_loc = [0, 0];
    if (Object.is(piece[0], Piece.King)) {
        base_loc = [0, 0];
    }
    else if (Object.is(piece[0], Piece.Queen)) {
        base_loc = [43, 0];
    }
    else if (Object.is(piece[0], Piece.Bishop)) {
        base_loc = [90, 0];
    }
    else if (Object.is(piece[0], Piece.Knight)) {
        base_loc = [135, 0];
    }
    else if (Object.is(piece[0], Piece.Rook)) {
        base_loc = [182, 0];
    }
    else if (Object.is(piece[0], Piece.Pawn)) {
        base_loc = [224, 0];
    }
    if (Object.is(piece[1], Color.Black)) {
        base_loc[1] += 45;
    }
    return base_loc;
}
var squares = [
    [[Piece.Rook, Color.Black], [Piece.Knight, Color.Black], [Piece.Bishop, Color.Black], [Piece.Queen, Color.Black], [Piece.King, Color.Black], [Piece.Bishop, Color.Black], [Piece.Knight, Color.Black], [Piece.Rook, Color.Black]],
    [[Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black], [Piece.Pawn, Color.Black]],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [[Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White], [Piece.Pawn, Color.White]],
    [[Piece.Rook, Color.White], [Piece.Knight, Color.White], [Piece.Bishop, Color.White], [Piece.Queen, Color.White], [Piece.King, Color.White], [Piece.Bishop, Color.White], [Piece.Knight, Color.White], [Piece.Rook, Color.White]],
];
// var mapping: FixedLengthArray<FixedLengthArray<MappedTile, 4>, 4> = [
//   [[0, 0], [1, 0], [2, 0], [3, 0]],
//   [[0, 1], [1, 1], [2, 1], [3, 1]],
//   [[0, 2], [1, 2], [2, 2], [3, 2]],
//   [[0, 3], [1, 3], [2, 3], [3, 3]]
// ];
var empty_location = [3, 2];
var turn = Color.White;
// /**
//  * Converts an unmapped tile to a mapped tile.
//  * @param tile The tile.
//  * @returns The mapped tile.
//  */
// function get_mapped_tile(tile: UnmappedTile): MappedTile {
//   return mapping[tile[1]][tile[0]];
// }
// function get_unmapped_tile(tile: MappedTile): UnmappedTile {
//   let pos: UnmappedTile = [-1, -1];
//   for (const [y, x] of mapping.map((v) => v.findIndex((v) => squares_equal(v, tile))).entries()) {
//     if (x > -1) {
//       pos = [y, x];
//       break;
//     }
//   }
//   return pos;
// }
/**
 * Get the tile of the square.
 * @param sq The base square.
 * @returns The tile of the square.
 */
function get_tile(sq) {
    return [Math.floor(sq[0] / 2), Math.floor(sq[1] / 2)];
}
// /**
//  * Map a square based on its tile.
//  * @param sq The base square.
//  * @returns The mapped square.
//  */
// function map_square(sq: UnmappedSquare): MappedSquare {
//   const tile = get_tile(sq);
//   const mapped_tile = get_mapped_tile(tile);
//   const tile_offset = [mapped_tile[0] - tile[0], mapped_tile[1] - tile[1]];
//   const offset = [tile_offset[0] * 2, tile_offset[1] * 2];
//   return [sq[0] + offset[0], sq[1] + offset[1]];
// }
// function unmap_square(sq: MappedSquare): UnmappedSquare {
//   const tile = get_tile(sq);
//   const unmapped_tile = get_unmapped_tile(tile);
//   const tile_offset = [tile[0] - unmapped_tile[0], tile[1] - unmapped_tile[1]];
//   const offset = [tile_offset[0] * 2, tile_offset[1] * 2];
//   return [sq[0] - offset[0], sq[1] - offset[1]];
// }
/**
 * Get the value of an unmapped square after mapping it.
 * @param sq The square.
 * @returns The square's value.
 */
function get_square(sq) {
    // const sq_offset = map_square(sq);
    return squares[sq[1]][sq[0]];
}
function get_squares(tile) {
    const base = [tile[0] * 2, tile[1] * 2];
    return [
        [get_square(base), get_square([base[0] + 1, base[1]])],
        [get_square([base[0], base[1] + 1]), get_square([base[0] + 1, base[1] + 1])],
    ];
}
function set_square(sq, piece) {
    // const sq_offset = map_square(sq);
    squares[sq[1]][sq[0]] = piece;
}
function set_squares(tile, pieces) {
    const base = [tile[0] * 2, tile[1] * 2];
    set_square(base, pieces[0][0]);
    set_square([base[0] + 1, base[1]], pieces[0][1]);
    set_square([base[0], base[1] + 1], pieces[1][0]);
    set_square([base[0] + 1, base[1] + 1], pieces[1][1]);
}
function copy_squares(from, to) {
    set_squares(to, get_squares(from));
}
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
    Direction[Direction["Right"] = 4] = "Right";
})(Direction || (Direction = {}));
;
/**
 * Get the direction the provided tile can move in, or null if it can't.
 * @param tile The tile to check.
 * @returns The direction the provided tile can move.
 */
function move_dir(tile) {
    const diff = [tile[0] - empty_location[0], tile[1] - empty_location[1]];
    if (squares_equal(diff, [-1, 0])) {
        return Direction.Right;
    }
    else if (squares_equal(diff, [0, -1])) {
        return Direction.Down;
    }
    else if (squares_equal(diff, [1, 0])) {
        return Direction.Left;
    }
    else if (squares_equal(diff, [0, 1])) {
        return Direction.Up;
    }
    else {
        return null;
    }
}
/**
 * Move a tile in the provided direction.
 * @param tile The tile to move.
 * @param dir The direction to move the tile in.
 * @returns If it succeeded.
 */
function move_tile(tile, dir) {
    if (move_dir(tile) !== dir) {
        return false;
    }
    copy_squares(tile, empty_location);
    set_squares(tile, [[null, null], [null, null]]);
    empty_location = tile;
    return true;
}
function squares_equal(square1, square2) {
    return square1[0] == square2[0] && square1[1] == square2[1];
}
function flip_board() {
    squares.reverse();
    //mapping.reverse();
    empty_location = [empty_location[0], 3 - empty_location[1]];
}
function tile_to_offset(tile) {
    return [tile[0] * 150, tile[1] * 150];
}
function square_to_offset(square) {
    return [square[0] * 75, square[1] * 75];
}
function offset_to_square(pos) {
    return [Math.floor(pos[0] / 75), Math.floor(pos[1] / 75)];
}
function draw_tile_outline(tile) {
    let pos = tile_to_offset(tile);
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(pos[0], pos[1], 150, 150);
}
function draw_square_background(square, color, set_white) {
    let pos = square_to_offset(square);
    if (color === Color.Black) {
        ctx.fillStyle = "#d8d5c9";
    }
    else {
        ctx.fillStyle = "#122054";
    }
    if (set_white) {
        ctx.fillStyle = "#ffffff";
    }
    ctx.fillRect(pos[0], pos[1], 75, 75);
}
function draw_piece(square, piece) {
    const pieces_image = document.getElementById("pieces");
    let pos = square_to_offset(square);
    let img_offset = get_location_in_pieces(piece);
    ctx.drawImage(pieces_image, img_offset[0], img_offset[1], 45, 45, pos[0] + 7.5, pos[1] + 7.5, 60, 60);
}
var highlight = null;
function draw_highlight(square) {
    let pos = square_to_offset(square);
    ctx.strokeStyle = "#e4e31d";
    ctx.strokeRect(pos[0] - 1, pos[1] + 1, 75, 75);
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
}
var squareToMove = null;
function tick(delta) {
    draw_all();
    requestAnimationFrame(tick);
}
function run() {
    tick(0);
    board.addEventListener('click', function (event) {
        const square = offset_to_square([Math.floor(event.pageX - canvasLeft), Math.floor(event.pageY - canvasTop)]);
        if (square[0] >= 64 || square[1] >= 64) {
            return;
        }
        const tile = get_tile(square);
        if (squareToMove === null && ((get_square(square) !== null && get_square(square)[1] == turn) || (move_dir(tile) && get_squares(tile).some((v) => v.some((v) => v !== null && v[1] === turn))))) {
            squareToMove = square;
            highlight = square;
        }
        else if (squareToMove !== null && squares_equal(square, squareToMove)) {
            squareToMove = null;
            highlight = null;
        }
        else if (squareToMove !== null && !squares_equal(tile, empty_location)) {
            const piece = get_square(squareToMove);
            set_square(square, piece);
            set_square(squareToMove, null);
            squareToMove = null;
            highlight = null;
            flip_board();
            turn = Color.opposite(turn);
        }
        else if (squareToMove !== null && move_dir(get_tile(squareToMove)) && squares_equal(tile, empty_location)) {
            move_tile(get_tile(squareToMove), move_dir(get_tile(squareToMove)));
            squareToMove = null;
            highlight = null;
            flip_board();
            turn = Color.opposite(turn);
        }
    }, false);
}
setTimeout(run, 50);
