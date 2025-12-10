import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 px-4 border-t border-gray-200 bg-gray-50 text-center">
      <p className="text-bible-900 font-bold text-sm tracking-wide mb-2">
        Desenvolvido por PAPTECH/2025
      </p>
      <div className="text-gray-500 text-xs space-y-1">
        <p>TEL. 924052039</p>
        <p>TEL. 953280289</p>
      </div>
      <p className="text-[10px] text-gray-400 mt-4">
        "Pregador Actual" - Todos os direitos reservados.
      </p>
    </footer>
  );
};