async function generateAndOpenPDF() {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;

    const LOGO_URL = 'src/images/I-CHAtLogo.png'; 
    const logoBytes = await fetch(LOGO_URL).then(res => res.arrayBuffer());
    
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const form = pdfDoc.getForm();
    const { height: pageHeight } = page.getSize();

    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.25); 

    const logoX = (600 / 2) - (logoDims.width / 2);
    const logoY = pageHeight - logoDims.height - 20;

    page.drawImage(logoImage, {
        x: logoX,
        y: logoY,
        width: logoDims.width,
        height: logoDims.height,
    });

    const formStartX = 30;
    let currentY = logoY - 40;
    const rowHeight = 35; 
    const tableWidth = 540;
    const headerHeight = rowHeight;
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;
    const sectionTitleFontSize = 16;
    const sectionDescriptionFontSize = 12;
    const sectionDescriptionColor = rgb(0.2, 0.5, 1);
    const mainTitleFontSize = 24; // New font size for the main title

    // Add main title
    const mainTitle = 'Home Owner Application:';
    const mainTitleWidth = helveticaBoldFont.widthOfTextAtSize(mainTitle, mainTitleFontSize);
    const mainTitleX = (600 - mainTitleWidth) / 2;
    const mainTitleY = currentY - 20;

    page.drawText(mainTitle, {
        x: mainTitleX,
        y: mainTitleY,
        size: mainTitleFontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
    });
    currentY = mainTitleY - 20; // Adjust currentY to account for the new title

    // Custom function to split text into lines
    function splitText(text, font, size, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + ' ' + word;
            const testWidth = font.widthOfTextAtSize(testLine, size);

            if (testWidth < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // Add Disclaimer and Privacy Statement
    const disclaimerData = [
        {
            text: 'This form is for interested home owners, who wish to establish a mutually beneficial shared living arrangement. This form can be filled out digitally here, or you can print it first and fill it out by hand. Please fill in all sections to the best of your ability. Once completed, please email the form to: enquiries@ICHAt.com.au',
            color: rgb(0, 0, 0),
        },
        {
            text: 'Alternatively, you can post it to: I-CHAt, PO Box 315, Northcote, VIC 3070.',
            color: rgb(0, 0, 0),
        },
        {
            text: 'If you have any questions or queries, please call us on (07) 9482 1185.',
            color: rgb(0, 0, 0),
        },
        {
            text: 'The information collected here is for the sole purpose of assessing your eligibility for our homeshare program and will be kept confidential. We will only use this information to match you with a suitable homeshare partner and will not share it with any third parties without your explicit consent. For more information, please refer to our Privacy Policy at: www.I-CHAt.com.au/privacy-policy/.',
            color: rgb(0.2, 0.2, 0.2),
        },
    ];

    const disclaimerFontSize = 14;
    const disclaimerLineHeight = 1.2 * disclaimerFontSize;
    const disclaimerMaxWidth = tableWidth;
    
    // Loop through the data array to draw each text section
    for (const section of disclaimerData) {
        const lines = splitText(section.text, helveticaFont, disclaimerFontSize, disclaimerMaxWidth);
        currentY -= lines.length * disclaimerLineHeight + 10;
        
        lines.forEach((line, index) => {
            page.drawText(line, {
                x: formStartX,
                y: currentY + (lines.length - 1 - index) * disclaimerLineHeight,
                size: disclaimerFontSize,
                font: helveticaFont,
                color: section.color,
            });
        });
    }

    // Adjust Y position for the first form section
    currentY -= 20; 

    const sectionsData = [
        {
            title: 'Personal Information',
            description: 'Please fill out your basic contact and identity details.',
            type: 'form',
            fields: [
                { name: 'Given Name/s:', columnLength: 2 },
                { name: 'Surname:', columnLength: 1 },
                { name: 'Year of Birth:', columnLength: 1},
                { name: 'Mobile:', columnLength: 1 },
                { name: 'Landline:', columnLength: 1 },
                { name: 'Email Address:', columnLength: 2 },
            ]
        },
        {
            title: 'Home Details',
            description: 'Please provide your residential address, and when the property will be available. Please, specify details about your property including: its type (House, Apartment ect.), the number of private and available bedrooms, bathrooms, parking spaces and the parking space type. Finally, please indicate if the property is a retirement living property.',
            type: 'form',
            fields: [
                { name: 'City:', columnLength: 1 },
                { name: 'State:', columnLength: 1 },
                { name: 'Postcode:', columnLength: 1 },
                { name: 'Available:', columnLength: 1, type: 'date' },
                { name: 'Private Bedrooms:', columnLength: 1 },
                { name: 'Bathrooms:', columnLength: 1 },
                { name: 'Parking Spaces:', columnLength: 1 },
                { name: 'Parking Type:', columnLength: 1, type: 'radio', options: ['Garage', 'Carport', 'Driveway', 'On-street'] },
                { name: 'Dwelling Type:', columnLength: 2, type: 'radio', options: ['House', 'Apartment', 'Duplex', 'Townhouse'] },
                { name: 'Retirement Living?:', columnLength: 2, type: 'radio', options: ['Yes', 'No'] },
            ]
        },
        {
            title: 'Amenities',
            description: 'Please select all available amenities at the property.',
            type: 'checkboxes',
            fields: [
                { name: 'Kitchen' },
                { name: 'Dishwasher' },
                { name: 'Washing Machine' },
                { name: 'Air Conditioning' },
                { name: 'Heating' },
                { name: 'Wi-Fi' },
                { name: 'Swimming Pool' },
                { name: 'Outdoor Space' },
                { name: 'In-home Gym' },
                { name: 'Close Proximity to Public Transport' },
                { name: 'Private Study Area' },
            ]
        },
        {
            title: 'About',
            description: 'Tell us a bit about yourself and what you want to get out of the homeshare program.',
            type: 'form',
            fields: Array.from({ length: 12 }, (_, i) => ({ name: 'a'+`${i + 10}`, columnLength: 2 }))
        },
        {
            title: 'Agreement Preferences',
            description: 'Please specify any relevent care needs and or living-arrangement conditions you might have, for example, transport needs, non-smoker requirements, cooking arrangments ect.',
            type: 'form',
            fields: Array.from({ length: 6 }, (_, i) => ({ name: 'c'+`${i + 10}`, columnLength: 2 }))
        },
    ];

    function drawDateField(page, form, field, x, y, width, height, font, fontSize) {
        const fieldBaseName = field.name.replace(/\s/g, '_').toLowerCase();
        const inputWidth = (width - 20) / 3;
        form.createTextField(`${fieldBaseName}_day`).addToPage(page, { x, y, width: inputWidth, height, font, textColor: rgb(0, 0, 0), borderWidth: 0, fontSize, maxLength: 2 });
        page.drawText('/', { x: x + inputWidth + 5, y: y + 6, size: fontSize, font });
        form.createTextField(`${fieldBaseName}_month`).addToPage(page, { x: x + inputWidth + 10, y, width: inputWidth, height, font, textColor: rgb(0, 0, 0), borderWidth: 0, fontSize, maxLength: 2 });
        page.drawText('/', { x: x + (inputWidth * 2) + 15, y: y + 6, size: fontSize, font });
        form.createTextField(`${fieldBaseName}_year`).addToPage(page, { x: x + (inputWidth * 2) + 20, y, width: inputWidth, height, font, textColor: rgb(0, 0, 0), borderWidth: 0, fontSize, maxLength: 4 });
    }

    function drawCheckboxes(page, form, fields, startY, formStartX, tableWidth, boxSize, spacing, fontSize, helveticaFont) {
        const totalItems = fields.length;
        const itemsInColumn = Math.ceil(totalItems / 2);
        let currentY = startY;

        // Draw first column
        for (let i = 0; i < itemsInColumn; i++) {
            const field = fields[i];
            const fieldBaseName = field.name.replace(/\s/g, '_').toLowerCase();
            const checkbox = form.createCheckBox(`checkbox_${fieldBaseName}`);
            checkbox.addToPage(page, { x: formStartX + 10, y: currentY - boxSize - 5, width: boxSize, height: boxSize });
            page.drawText(field.name, { x: formStartX + 30, y: currentY - boxSize, size: fontSize, font: helveticaFont });
            currentY -= spacing;
        }

        // Reset Y for the second column
        currentY = startY; 
        
        // Draw second column if there are enough items
        for (let i = itemsInColumn; i < totalItems; i++) {
            const field = fields[i];
            const fieldBaseName = field.name.replace(/\s/g, '_').toLowerCase();
            const checkbox = form.createCheckBox(`checkbox_${fieldBaseName}`);
            const col2StartX = formStartX + tableWidth / 2;
            checkbox.addToPage(page, { x: col2StartX + 10, y: currentY - boxSize - 5, width: boxSize, height: boxSize });
            page.drawText(field.name, { x: col2StartX + 30, y: currentY - boxSize, size: fontSize, font: helveticaFont });
            currentY -= spacing;
        }
    }

    function drawSectionHeader(page, section, index, currentY, headerHeight, tableWidth, formStartX, helveticaBoldFont, sectionTitleFontSize) {
        page.drawRectangle({
            x: formStartX,
            y: currentY - headerHeight,
            width: tableWidth,
            height: headerHeight,
            color: rgb(0.9, 0.9, 0.9)
        });

        page.drawText(`[${index + 1}] ${section.title}`, {
            x: formStartX + 10,
            y: currentY - 20,
            size: sectionTitleFontSize,
            font: helveticaBoldFont
        });

        page.drawLine({
            start: { x: formStartX, y: currentY - headerHeight },
            end: { x: formStartX + tableWidth, y: currentY - headerHeight },
            thickness: 1,
            color: rgb(0, 0, 0)
        });
    }

    for (const [index, section] of sectionsData.entries()) {
        const padding = 30;
        const sectionSpacing = 30;
        const sectionContentMargin = 10;
        const radioItemHeight = fontSize + 10; // For radio buttons with padding
        const checkboxItemHeight = 20;
        const textareaHeight = rowHeight * 6;
        
        // Calculate dynamic height for description
        const descriptionLines = section.description ? splitText(section.description, helveticaFont, sectionDescriptionFontSize, tableWidth) : [];
        const descriptionHeight = descriptionLines.length > 0 ? descriptionLines.length * (sectionDescriptionFontSize * 1.2) + sectionContentMargin : 0;
        
        let contentHeight;

        if (section.type === 'checkboxes') {
            const numRows = Math.ceil(section.fields.length / 2);
            contentHeight = numRows * checkboxItemHeight + sectionContentMargin;
        } else if (section.type === 'textarea') {
            contentHeight = textareaHeight;
        } else {
            let formContentHeight = 0;
            const rows = [];
            let i = 0;
            while (i < section.fields.length) {
                const field1 = section.fields[i];
                if (field1.columnLength === 2 || field1.type === 'radio') {
                    rows.push([field1]);
                    i++;
                } else {
                    const field2 = section.fields[i + 1];
                    if (field2 && field2.columnLength === 1) {
                        rows.push([field1, field2]);
                        i += 2;
                    } else {
                        rows.push([field1]);
                        i++;
                    }
                }
            }

            rows.forEach(row => {
                let currentRowHeight = rowHeight;
                if (row.length === 2 && row[1].type === 'radio') {
                    const optionsPerCol = Math.ceil(row[1].options.length / 2);
                    currentRowHeight = Math.max(rowHeight, optionsPerCol * radioItemHeight);
                } else if (row.length === 1 && row[0].type === 'radio') {
                    const optionsPerCol = Math.ceil(row[0].options.length / 2);
                    currentRowHeight = Math.max(rowHeight, optionsPerCol * radioItemHeight);
                }
                formContentHeight += currentRowHeight;
            });
            contentHeight = formContentHeight + 10;
        }

        const totalSectionHeight = headerHeight + descriptionHeight + contentHeight;

        if (currentY - totalSectionHeight - sectionSpacing < padding) {
            page = pdfDoc.addPage([600, 800]);
            currentY = pageHeight - padding;
        }

        currentY -= sectionSpacing;

        // Draw description text before the main rectangle
        if (section.description) {
            const lines = splitText(section.description, helveticaFont, sectionDescriptionFontSize, tableWidth);
            let descriptionDrawY = currentY;
            
            lines.forEach((line) => {
                descriptionDrawY -= (sectionDescriptionFontSize * 1.2);
                page.drawText(line, {
                    x: formStartX,
                    y: descriptionDrawY,
                    size: sectionDescriptionFontSize,
                    font: helveticaFont,
                    color: sectionDescriptionColor,
                });
            });
            currentY = descriptionDrawY - sectionContentMargin;
        }
        
        // Draw the main section box and header
        let contentBoxHeight = headerHeight + contentHeight;

        currentY -= contentBoxHeight;
        const sectionBoxY = currentY;
        const contentStartY = sectionBoxY + contentBoxHeight;

        page.drawRectangle({
            x: formStartX,
            y: sectionBoxY,
            width: tableWidth,
            height: contentBoxHeight,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0)
        });
        
        // Draw header
        drawSectionHeader(page, section, index, contentStartY, headerHeight, tableWidth, formStartX, helveticaBoldFont, sectionTitleFontSize);

        // Draw content based on type
        if (section.type === 'checkboxes') {
            const boxSize = 12;
            drawCheckboxes(page, form, section.fields, contentStartY - headerHeight, formStartX, tableWidth, boxSize, checkboxItemHeight, fontSize, helveticaFont);
        } else if (section.type === 'textarea') {
            form.createTextField('about_me_field').addToPage(page, {
                x: formStartX + 10,
                y: contentStartY - headerHeight - textareaHeight + 8,
                width: tableWidth - 20,
                height: textareaHeight - 14,
                font: helveticaFont,
                textColor: rgb(0, 0, 0),
                borderWidth: 0,
                fontSize,
                multiline: true,
            });
        } else { // Handle 'form' type
            const longestLabelWidth = section.fields.reduce((max, field) => {
                const textWidth = helveticaFont.widthOfTextAtSize(field.name, fontSize);
                return Math.max(max, textWidth);
            }, 0);
            const labelColWidth = longestLabelWidth + 20;

            const col1LabelX = formStartX + 10;
            const col1InputX = formStartX + labelColWidth;
            const col1InputWidth = (tableWidth / 2) - labelColWidth - 10;
            const col2LabelX = formStartX + tableWidth / 2 + 10;
            const col2InputX = formStartX + tableWidth / 2 + 120;
            const col2InputWidth = tableWidth / 2 - 130;

            let currentFieldY = contentStartY - headerHeight;
            const rows = [];
            let i = 0;
            while (i < section.fields.length) {
                const field1 = section.fields[i];
                if (field1.columnLength === 2 || field1.type === 'radio') {
                    rows.push([field1]);
                    i++;
                } else {
                    const field2 = section.fields[i + 1];
                    if (field2 && field2.columnLength === 1) {
                        rows.push([field1, field2]);
                        i += 2;
                    } else {
                        rows.push([field1]);
                        i++;
                    }
                }
            }

            rows.forEach((row, i) => {
                let currentRowHeight = rowHeight;
                if (row.length === 2 && row[1].type === 'radio') {
                    // For single-column radios, calculate height dynamically
                    const optionsPerCol = Math.ceil(row[1].options.length / 2);
                    currentRowHeight = Math.max(rowHeight, optionsPerCol * radioItemHeight + 10);
                } else if (row.length === 1 && row[0].type === 'radio' && row[0].columnLength !== 2) {
                    // This is the single-column radio group
                    const optionsPerCol = Math.ceil(row[0].options.length / 2);
                    currentRowHeight = Math.max(rowHeight, optionsPerCol * radioItemHeight + 10);
                }
                
                currentFieldY -= currentRowHeight;

                // Only draw the horizontal line if it's not the last row
                if (i < rows.length - 1) {
                    page.drawLine({
                        start: { x: formStartX, y: currentFieldY },
                        end: { x: formStartX + tableWidth, y: currentFieldY },
                        thickness: 1,
                        color: rgb(0, 0, 0)
                    });
                }

                if (row.length === 2) {
                    page.drawLine({
                        start: { x: formStartX + tableWidth / 2, y: currentFieldY + currentRowHeight },
                        end: { x: formStartX + tableWidth / 2, y: currentFieldY },
                        thickness: 1,
                        color: rgb(0, 0, 0)
                    });
                }

                const field1 = row[0];
                const field2 = row[1];
                
                // Conditionally draw text for field1's name
                if (section.title !== 'About' && section.title !== 'Agreement Preferences' && section.title !== 'Medical Conditions') {
                    page.drawText(field1.name, { 
                        x: col1LabelX, 
                        y: currentFieldY + (currentRowHeight / 2) - (fontSize / 2), 
                        size: fontSize, 
                        font: helveticaFont, 
                        maxWidth: labelColWidth - 10,
                        color: rgb(0, 0, 0)
                    });
                }
                
                if (field1.type === 'date') {
                    drawDateField(page, form, field1, col1InputX, currentFieldY + (currentRowHeight / 2) - (rowHeight - 14) / 2, col1InputWidth, rowHeight - 14, helveticaFont, fontSize);
                } else if (field1.type === 'radio') {
                    const radioGroup = form.createRadioGroup(field1.name.replace(/\s/g, '_').toLowerCase());
                    const radioSize = 12;
                    const interOptionSpacing = 10;
                    
                    if (field1.columnLength === 2) {
                        // Flat layout for 2-column span
                        let radioX = col1InputX;

                        field1.options.forEach(option => {
                            radioGroup.addOptionToPage(option, page, {
                                x: radioX,
                                y: currentFieldY + (currentRowHeight / 2) - (radioSize / 2),
                                width: radioSize,
                                height: radioSize,
                                borderWidth: 1,
                                borderColor: rgb(0, 0, 0),
                                backgroundColor: rgb(1, 1, 1),
                            });
                            page.drawText(option, { 
                                x: radioX + radioSize + 5, 
                                y: currentFieldY + (currentRowHeight / 2) - (fontSize / 2), 
                                size: fontSize, 
                                font: helveticaFont 
                            });
                            radioX += radioSize + 5 + helveticaFont.widthOfTextAtSize(option, fontSize) + interOptionSpacing;
                        });
                    } else {
                        // Wrapped layout for single-column span
                        const availableWidth = col1InputWidth;
                        let radioX = col1InputX;
                        const optionsPerCol = Math.ceil(field1.options.length / 2);

                        field1.options.forEach((option, j) => {
                            let currentX = radioX;
                            let currentYOffset = 0;
                            
                            if (j >= optionsPerCol) {
                                currentX = radioX + availableWidth / 2;
                                currentYOffset = (j - optionsPerCol) * radioItemHeight;
                            } else {
                                currentYOffset = j * radioItemHeight;
                            }

                            radioGroup.addOptionToPage(option, page, {
                                x: currentX,
                                y: currentFieldY + currentRowHeight - 10 - radioSize - currentYOffset,
                                width: radioSize,
                                height: radioSize,
                                borderWidth: 1,
                                borderColor: rgb(0, 0, 0),
                                backgroundColor: rgb(1, 1, 1),
                            });
                            page.drawText(option, { 
                                x: currentX + radioSize + 5, 
                                y: currentFieldY + currentRowHeight - 10 - radioSize - currentYOffset, 
                                size: fontSize, 
                                font: helveticaFont 
                            });
                        });
                    }
                } else {
                    const textField1 = form.createTextField(`${field1.name.replace(/\s/g, '_')}_field`);
                    const inputWidth1 = field1.columnLength === 2 ? tableWidth - labelColWidth - 10 : col1InputWidth;
                    textField1.addToPage(page, { x: col1InputX, y: currentFieldY + (currentRowHeight / 2) - (rowHeight - 14) / 2, width: inputWidth1, height: rowHeight - 14, font: helveticaFont, textColor: rgb(0, 0, 0), borderWidth: 0, fontSize });
                }

                if (row.length > 1) {
                    // Conditionally draw text for field2's name
                    if (section.title !== 'About' && section.title !== 'Care Needs') {
                        page.drawText(field2.name, { 
                            x: col2LabelX, 
                            y: currentFieldY + (currentRowHeight / 2) - (fontSize / 2), 
                            size: fontSize, 
                            font: helveticaFont, 
                            maxWidth: 100,
                            color: rgb(0, 0, 0)
                        });
                    }
                    if (field2.type === 'date') {
                        drawDateField(page, form, field2, col2InputX, currentFieldY + (currentRowHeight / 2) - (rowHeight - 14) / 2, col2InputWidth, rowHeight - 14, helveticaFont, fontSize);
                    } else if (field2.type === 'radio') {
                        const radioGroup = form.createRadioGroup(field2.name.replace(/\s/g, '_').toLowerCase());
                        const radioSize = 12;
                        const interOptionSpacing = 10;
                        const availableWidth = col2InputX + col2InputWidth - col2LabelX - helveticaFont.widthOfTextAtSize(field2.name, fontSize) - 20;

                        let radioX = col2LabelX + helveticaFont.widthOfTextAtSize(field2.name, fontSize) + 10;
                        const optionsPerCol = Math.ceil(field2.options.length / 2);

                        field2.options.forEach((option, j) => {
                            let currentX = radioX;
                            let currentYOffset = 0;
                            
                            if (j >= optionsPerCol) {
                                currentX = radioX + availableWidth / 2;
                                currentYOffset = (j - optionsPerCol) * radioItemHeight;
                            } else {
                                currentYOffset = j * radioItemHeight;
                            }

                            radioGroup.addOptionToPage(option, page, {
                                x: currentX,
                                y: currentFieldY + currentRowHeight - 10 - radioSize - currentYOffset,
                                width: radioSize,
                                height: radioSize,
                                borderWidth: 1,
                                borderColor: rgb(0, 0, 0),
                                backgroundColor: rgb(1, 1, 1),
                            });
                            page.drawText(option, { 
                                x: currentX + radioSize + 5, 
                                y: currentFieldY + currentRowHeight - 10 - radioSize - currentYOffset, 
                                size: fontSize, 
                                font: helveticaFont 
                            });
                        });
                    } else {
                        const textField2 = form.createTextField(`${field2.name.replace(/\s/g, '_')}_field`);
                        textField2.addToPage(page, { x: col2InputX, y: currentFieldY + (currentRowHeight / 2) - (rowHeight - 14) / 2, width: col2InputWidth, height: rowHeight - 14, font: helveticaFont, textColor: rgb(0, 0, 0), borderWidth: 0, fontSize });
                    }
                }
            });
            currentY = currentFieldY;
        }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    pdfDoc.setTitle('Application for Homeshare');
    window.open(url);
}