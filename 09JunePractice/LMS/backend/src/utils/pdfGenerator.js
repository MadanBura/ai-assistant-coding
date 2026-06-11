const generatePDFBuffer = ({ name, courseTitle, date, certificateId }) => {
  // Escape parentheses in fields to maintain PDF syntax validity
  const cleanName = (name || '').replace(/[()]/g, '');
  const cleanTitle = (courseTitle || '').replace(/[()]/g, '');
  const cleanDate = (date || '').replace(/[()]/g, '');
  const cleanCertId = (certificateId || '').replace(/[()]/g, '');

  const textContent = `BT
/F1 24 Tf
100 700 Td
(Certificate of Completion) Tj
ET
BT
/F1 16 Tf
100 600 Td
(This is to certify that) Tj
ET
BT
/F1 20 Tf
100 550 Td
(${cleanName}) Tj
ET
BT
/F1 16 Tf
100 500 Td
(has successfully completed the course) Tj
ET
BT
/F1 20 Tf
100 450 Td
(${cleanTitle}) Tj
ET
BT
/F1 12 Tf
100 400 Td
(Date: ${cleanDate}) Tj
ET
BT
/F1 12 Tf
100 350 Td
(Certificate ID: ${cleanCertId}) Tj
ET`;

  const streamBody = textContent + '\n';
  const contentLength = Buffer.byteLength(streamBody, 'utf8');

  // Objects and structural layout definitions
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n';
  const obj4Header = `4 0 obj\n<< /Length ${contentLength} >>\nstream\n`;
  const obj4Footer = 'endstream\nendobj\n';

  // Calculate byte offsets for the cross-reference (xref) table
  const header = '%PDF-1.4\n';
  const offset1 = header.length;
  const offset2 = offset1 + obj1.length;
  const offset3 = offset2 + obj2.length;
  const offset4 = offset3 + obj3.length;
  const offsetXref = offset4 + obj4Header.length + contentLength + obj4Footer.length;

  const xref = `xref
0 5
0000000000 65535 f \r
${String(offset1).padStart(10, '0')} 00000 n \r
${String(offset2).padStart(10, '0')} 00000 n \r
${String(offset3).padStart(10, '0')} 00000 n \r
${String(offset4).padStart(10, '0')} 00000 n \r
`;

  const trailer = `trailer
<< /Size 5 /Root 1 0 R >>
startxref
${offsetXref}
%%EOF
`;

  const pdfParts = [
    header,
    obj1,
    obj2,
    obj3,
    obj4Header,
    streamBody,
    obj4Footer,
    xref,
    trailer
  ];

  return Buffer.concat(pdfParts.map(part => Buffer.from(part, 'utf8')));
};

module.exports = { generatePDFBuffer };
