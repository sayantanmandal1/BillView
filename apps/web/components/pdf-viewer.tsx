'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  fileUrl: string | null;
}

export function PDFViewer({ fileUrl }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fileUrl) return;

    const loadPDF = async () => {
      setLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [fileUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let renderTask: pdfjsLib.RenderTask | null = null;

    const renderPage = async () => {
      try {
        // Cancel any ongoing render task
        if (renderTask) {
          renderTask.cancel();
        }

        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
        renderTask = null;
      } catch (error) {
        if (error instanceof Error && error.name === 'RenderingCancelledException') {
          // Ignore cancellation errors
          return;
        }
        console.error('Error rendering page:', error);
      }
    };

    renderPage();

    // Cleanup function
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, currentPage, scale]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(scale * 1.2);
  };

  const zoomOut = () => {
    setScale(scale / 1.2);
  };

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">No PDF selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading PDF...</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 bg-white shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}