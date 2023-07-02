const PDFDocument = require('pdfkit');
const axios = require("axios");
const Crop = require("../model/CropModel");
const User = require("../model/UserModel");


// Report Format
function formatReport(doc, reportTitle) {
    doc.font('Times-Roman')
        .fontSize(30)
        .text('AgriBrain', 50, 50);

    doc.image('./Image/AgribrainLogo.png', doc.page.width - 150, 50, { width: 100 });

    doc.fontSize(10)
        .text('B-16-3, Endah Regal Condominium, Taman Sri Endah, Bandar Baru Sri Petaling, 57000, Kuala Lumpur, Malaysia', { align: 'left', width: 200 });

    const lineYa = 155; // Y-coordinate of the line
    const lineYb = 185;

    doc
        .moveTo(50, lineYa) // Starting point of the line
        .lineTo(doc.page.width - 50, lineYa) // Ending point of the line
        .lineWidth(1) // Set line width to 1
        .stroke(); // Draw the line

    doc.moveDown(1);

    doc
        .moveTo(50, lineYb) // Starting point of the line
        .lineTo(doc.page.width - 50, lineYb) // Ending point of the line
        .lineWidth(1) // Set line width to 1
        .stroke(); // Draw the line


    doc.fontSize(18)
        .text(reportTitle, { align: 'center' });

    doc.moveDown();
}

//End of content line
function drawEndLine(doc, y) {
    doc
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .lineWidth(1)
        .stroke();
}


// Get Crop Info
async function getCrop(callback) {
    try {
        const response = await Crop.findAll({
            attributes: ['id', 'crop_uuid', 'crop_name', 'crop_active'],
            include: [
                {
                    model: User,
                    attributes: ['user_fullname', 'user_email'],
                },
            ],
        });
        callback(response);
    } catch (error) {
        console.error(error);
        callback(null, error);
    }
}


// Generate Crop Report
async function generateCropReport() {
    const table = {
        title: 'Crop Report',
        headers: ['No', 'Crop', 'Active', 'User Name', 'Email'],
    };

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        formatReport(doc, 'Crop Report');

        const headerWidths = [53, 105, 190, 300, 450];
        const contentWidths = [57, 100, 195, 295, 420];

        // Display the header with aligned columns and font size 12px
        table.headers.forEach((header, index) => {
            doc.fontSize(12).text(header, headerWidths[index], doc.y, { width: headerWidths[index], align: 'left' });
            doc.moveUp();
        });

        doc.moveDown(2);

        getCrop((cropData, error) => {
            if (error) {
                console.error(error);
                doc.text('Error fetching crop data.');
            } else {
                cropData.forEach((crop, index) => {
                    const cropInfo = [
                        (index + 1).toString(), // Add the "No" value
                        crop.crop_name,
                        crop.crop_active.toString(),
                        crop.USER_T.user_fullname,
                        crop.USER_T.user_email,
                    ];

                    cropInfo.forEach((info, index) => {
                        doc.fontSize(12).text(info, contentWidths[index], doc.y, { width: contentWidths[index], align: 'left' });
                        doc.moveUp();
                    });

                    doc.moveDown(1.5); // Add space of 0.5 line between rows
                });
            }

            // Add a line after the content
            drawEndLine(doc, doc.y + 5);

            const currentDate = new Date().toLocaleString();
            const textWidth = doc.widthOfString(`Created Date and Time: ${currentDate}`);
            doc.fontSize(12).text(`Created Date and Time: \n ${currentDate}`, 50, doc.y + 50, { align: 'left', width: textWidth });

            doc.end();
        });
    });
}



// Generate Crop Management Report
function generateCropManagementReport() {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        formatReport(doc, 'Crop Management Report');

        doc.end();
    });
}

function generateFarmingRecordReport() {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        formatReport(doc, 'Farming Record Report');

        doc.end();
    });
}

module.exports = {
    generateCropReport,
    generateCropManagementReport,
    generateFarmingRecordReport,
};