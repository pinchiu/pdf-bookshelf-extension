import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function generateThumbnail(fileOrBlob) {
  let objectUrl = null;
  try {
    objectUrl = URL.createObjectURL(fileOrBlob);
    const loadingTask = pdfjsLib.getDocument({ url: objectUrl });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1); // Get first page

    const viewport = page.getViewport({ scale: 1.0 }); // Adjust scale as needed
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
