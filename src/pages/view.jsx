import React from 'react';

export default function ViewPDF() {
    // Encoding the file name to handle non-ASCII characters
    const fileName = encodeURIComponent('主膠領料單-常用料.pdf');
    const filePath = `/doc/${fileName}`;

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="pdf-viewer">
            <label htmlFor="file-upload" className="block text-xl font-semibold leading-6 text-gray-900">
              主膠PDF
          </label>
            <iframe
                src={filePath}
                style={{ height: '1000px', width: '100%' }}
                frameBorder="0"
                title="PDF Viewer"
            ></iframe>
            </div>
        </div>
        
    );
}
