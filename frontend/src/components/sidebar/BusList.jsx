import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function BusList({ buses, selectedBuses, onBusSelect }) {
  const listRef = useRef();

  const handleDownload = async () => {
    const element = listRef.current;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(async () => {
      const originalCanvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgWidth = 595.28;
      const imgHeight = (originalCanvas.height * imgWidth) / originalCanvas.width;
      const pageHeight = 841.89;

      const pdf = new jsPDF('p', 'pt', 'a4');
      const totalPages = Math.ceil(imgHeight / pageHeight);

      for (let i = 0; i < totalPages; i++) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const sliceHeight = Math.min(
          originalCanvas.height - i * (pageHeight * originalCanvas.width / imgWidth),
          pageHeight * originalCanvas.width / imgWidth
        );

        canvas.width = originalCanvas.width;
        canvas.height = sliceHeight;

        context.drawImage(
          originalCanvas,
          0,
          i * (pageHeight * originalCanvas.width / imgWidth),
          originalCanvas.width,
          sliceHeight,
          0,
          0,
          originalCanvas.width,
          sliceHeight
        );

        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, (sliceHeight * imgWidth) / originalCanvas.width);
      }

      pdf.save('bus-list.pdf');
    }, 500);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Bus List</h2>
        <button
          onClick={handleDownload}
          className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
        >
          Download PDF
        </button>
      </div>

      {/* Printable Area */}
      <div ref={listRef} className="bg-white p-2 rounded-md space-y-2 w-full max-w-full">
        {buses.length === 0 ? (
          <p className="text-gray-500 text-sm">No buses available</p>
        ) : (
          <ul className="space-y-2">
            {buses.map((bus) => (
              <li key={bus.busNumber}>
                <button
                  onClick={() => onBusSelect(bus.busNumber)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition ${
                    selectedBuses.includes(bus.busNumber)
                      ? 'bg-indigo-100 border-indigo-500'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-base">Bus Route {bus.busNumber}</div>
                  {bus.routePath && (
                    <div className="mt-1 text-sm text-gray-600">
                      {bus.routePath.join(' → ')}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default BusList;
