import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface NominasPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function NominasPagination({
  currentPage,
  totalPages,
  onPageChange
}: NominasPaginationProps) {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Siempre mostrar la primera página
    pageNumbers.push(1);
    
    // Determinar rango de páginas alrededor de la página actual
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Ajustar si estamos cerca del inicio
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    }
    
    // Ajustar si estamos cerca del final
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }
    
    // Añadir elipsis al inicio si es necesario
    if (startPage > 2) {
      pageNumbers.push('ellipsis-start');
    }
    
    // Añadir páginas del rango
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Añadir elipsis al final si es necesario
    if (endPage < totalPages - 1) {
      pageNumbers.push('ellipsis-end');
    }
    
    // Siempre mostrar la última página si hay más de una
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          
          const pageNumber = page as number;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                onClick={() => onPageChange(pageNumber)}
                isActive={pageNumber === currentPage}
                className="cursor-pointer"
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}