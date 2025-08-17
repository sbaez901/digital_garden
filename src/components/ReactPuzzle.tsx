import React, { useState, useEffect } from 'react';

interface ReactPuzzleProps {
  imageSrc: string;
  revealedPieces: number;
  totalPieces: number;
  onPieceRevealed?: () => void;
}

export default function ReactPuzzle({ 
  imageSrc, 
  revealedPieces, 
  totalPieces, 
  onPieceRevealed 
}: ReactPuzzleProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 3, cols: 3 });
  const [pieceOrder, setPieceOrder] = useState<number[]>([]);

  // Initialize puzzle when image changes
  useEffect(() => {
    if (!imageSrc) return;

    console.log('🧩 ReactPuzzle: Initializing simple grid puzzle!', { imageSrc, totalPieces });
    
    // Calculate grid size based on total pieces
    // For better visual balance, prefer more columns than rows
    const size = Math.ceil(Math.sqrt(totalPieces));
    let rows, cols;
    
    if (totalPieces === 12) {
      // Special case for 12 pieces: 3x4 grid looks better
      rows = 3;
      cols = 4;
    } else {
      rows = Math.min(size, 5); // Max 5 rows to keep pieces visible
      cols = Math.ceil(totalPieces / rows);
    }
    
    setGridSize({ rows, cols });
    
    // Generate random order for piece reveals
    const randomOrder = Array.from({ length: totalPieces }, (_, i) => i);
    for (let i = randomOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
    }
    setPieceOrder(randomOrder);
    
    setIsInitialized(true);
    console.log('🧩 ReactPuzzle: Grid configured with', { rows, cols, totalPieces, randomOrder });
  }, [imageSrc, totalPieces]);

  // Update revealed pieces
  useEffect(() => {
    if (!isInitialized) return;
    
    const currentRevealedPieces = pieceOrder.slice(0, revealedPieces);
    console.log('🧩 ReactPuzzle: Updating revealed pieces:', { 
      revealedPieces, 
      totalPieces, 
      pieceOrder,
      currentRevealedPieces 
    });
  }, [revealedPieces, totalPieces, isInitialized, pieceOrder]);

  if (!isInitialized || !imageSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-emerald-600 dark:text-emerald-400 text-lg transition-colors duration-300">🧩 Loading Puzzle...</div>
      </div>
    );
  }

  // Calculate how many pieces to show
  const piecesToShow = Math.min(revealedPieces, totalPieces);
  
  return (
    <div className="w-full h-full relative">
      {/* Debug info */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-2 rounded z-10">
        Simple Grid Puzzle: {piecesToShow}/{totalPieces} pieces revealed
      </div>
      
      {/* Background overlay to hide unrevealed pieces */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/50 dark:to-green-900/50 rounded-lg transition-colors duration-300"
        style={{ zIndex: 15 }}
      />
      
      {/* Individual puzzle pieces with reveal effect */}
      {Array.from({ length: totalPieces }, (_, index) => {
        const row = Math.floor(index / gridSize.cols);
        const col = index % gridSize.cols;
        // Use random order to determine if piece should be revealed
        const isRevealed = pieceOrder.length > 0 && pieceOrder.indexOf(index) < piecesToShow;
        
        // Debug logging for piece reveal
        if (index === 0) {
          console.log(`🧩 ReactPuzzle: Piece reveal logic:`, {
            totalPieces,
            piecesToShow,
            pieceOrder,
            index,
            isRevealed,
            pieceOrderIndex: pieceOrder.indexOf(index)
          });
        }
        
        return (
          <div
            key={index}
            className={`absolute transition-all duration-1000 rounded-lg ${
              isRevealed 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}
            style={{
              left: `${(col / gridSize.cols) * 100}%`,
              top: `${(row / gridSize.rows) * 100}%`,
              width: `${100 / gridSize.cols}%`,
              height: `${100 / gridSize.rows}%`,
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: `${gridSize.cols * 100}% ${gridSize.rows * 100}%`,
              backgroundPosition: `${-col * 100}% ${-row * 100}%`,
              zIndex: isRevealed ? 20 : 5
            }}
          />
        );
      })}
      
      {/* Grid overlay to make it look like puzzle pieces */}
      <div 
        className="absolute inset-0 transition-colors duration-300"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.2) 2px, transparent 2px),
            linear-gradient(to bottom, rgba(0,0,0,0.2) 2px, transparent 2px)
          `,
          backgroundSize: `${100 / gridSize.cols}% ${100 / gridSize.rows}%`,
          opacity: 0.6,
          zIndex: 25
        }}
      />
      
      {/* No overlay - puzzle pieces are revealed through the grid system */}
    </div>
  );
}
