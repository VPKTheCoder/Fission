import Cell from './Cell.jsx';
import { PLAYER } from '../utils/constants.js';
import { canPlace } from '../utils/gameLogic.js';

export default function Board({ board, currentPlayer, explodingCells, isAnimating, onCellClick, lastMove, cursorPos, hintCell, placingCell, isTwoPlayer = false, activeAbility, stabilizeTarget }) {
  return (
    <section className="board-container" aria-label="FISSION board">
      <div className="board-grid">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isValidMove =
              !isAnimating &&
              canPlace(board, rowIndex, colIndex, currentPlayer) &&
              (isTwoPlayer || currentPlayer === PLAYER.HUMAN);

            const isLastMove = lastMove && lastMove.row === rowIndex && lastMove.col === colIndex;
            const isCursor = cursorPos && cursorPos.row === rowIndex && cursorPos.col === colIndex;
            const isHint = hintCell && hintCell.row === rowIndex && hintCell.col === colIndex;
            const isPlacing = placingCell && placingCell.row === rowIndex && placingCell.col === colIndex;
            const isStabilizeTarget = stabilizeTarget && stabilizeTarget.row === rowIndex && stabilizeTarget.col === colIndex;

            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isValidMove={isValidMove}
                isExploding={explodingCells.has(`${rowIndex},${colIndex}`)}
                onClick={() => onCellClick(rowIndex, colIndex)}
                currentPlayer={currentPlayer}
                isLastMove={isLastMove}
                isCursor={isCursor}
                isHint={isHint}
                isPlacing={isPlacing}
                isStabilizeTarget={isStabilizeTarget}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
