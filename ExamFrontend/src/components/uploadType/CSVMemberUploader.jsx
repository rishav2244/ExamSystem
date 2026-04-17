import { useState } from 'react';
import Papa from 'papaparse';

export const CSVMemberUploader = ({ onEmailsParsed, onError }) => {
    const [fileName, setFileName] = useState('');
    const [previewList, setPreviewList] = useState([]);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^\S+@\S+\.\S+$/);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        Papa.parse(file, {
            header: false,
            skipEmptyLines: 'greedy',
            complete: (results) => {
                const rows = results.data;
                if (rows.length < 2) {
                    onError("The CSV file must have a header row and at least one data row.");
                    return;
                }

                const headerRow = rows[0];
                const emailIndices = headerRow.reduce((acc, header, idx) => {
                    if (header && header.toLowerCase().trim() === 'email') {
                        acc.push(idx);
                    }
                    return acc;
                }, []);

                if (emailIndices.length === 0) {
                    onError("No column named 'Email' was found.");
                    return;
                }

                const extractedEmails = new Set();
                let invalidCount = 0;
                
                for (let i = 1; i < rows.length; i++) {
                    const currentRow = rows[i];

                    emailIndices.forEach(index => {
                        const email = currentRow[index]?.trim();
                        if (email) {
                            if (validateEmail(email)) {
                                extractedEmails.add(email.toLowerCase());
                            } else {
                                invalidCount++;
                            }
                        }
                    });
                }

                const finalArray = Array.from(extractedEmails);
                setPreviewList(finalArray);
                onEmailsParsed(finalArray);

                if (finalArray.length === 0) {
                    onError("No valid emails detected in the columns.");
                } else if (invalidCount > 0) {
                    onError(`Detected ${finalArray.length} unique emails. ${invalidCount} invalid entries were ignored.`, 'warning');
                }
            }
        });
    };

    return (
        <div className="csv-uploader-container">
            <div className="csv-upload-zone">
                <div className="upload-instructions">
                    <p>Upload CSV. <strong>All</strong> columns named 'Email' will be scanned.</p>
                </div>
                <label className="file-input-label">
                    {fileName || "Choose CSV File"}
                    <input type="file" accept=".csv" onChange={handleFileUpload} hidden />
                </label>
            </div>

            {previewList.length > 0 && (
                <div className="csv-preview-section">
                    <div className="csv-preview-header">
                        <strong>Detected Emails ({previewList.length}):</strong>
                        <button type="button" className="csv-clear-btn" onClick={() => {
                            setPreviewList([]);
                            onEmailsParsed([]);
                            setFileName('');
                        }}>Clear</button>
                    </div>
                    <div className="csv-preview-list">
                        {previewList.map((email, idx) => (
                            <div key={idx} className="csv-preview-item">{email}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};