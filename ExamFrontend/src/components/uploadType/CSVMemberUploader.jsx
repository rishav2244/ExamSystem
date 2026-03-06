import { useState } from 'react';
import Papa from 'papaparse';

export const CSVMemberUploader = ({ onEmailsParsed, onError }) => {
    const [fileName, setFileName] = useState('');

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
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data;
                if (data.length === 0) {
                    onError("The CSV file is empty.");
                    return;
                }

                const headers = Object.keys(data[0]);
                const emailColumns = headers.filter(h => h.toLowerCase() === 'email');

                if (emailColumns.length === 0) {
                    onError("No column named 'Email' was found in the CSV.");
                    return;
                }

                const extractedEmails = new Set();
                let invalidCount = 0;

                data.forEach(row => {
                    emailColumns.forEach(col => {
                        const email = row[col]?.trim();
                        if (email) {
                            if (validateEmail(email)) {
                                extractedEmails.add(email.toLowerCase());
                            } else {
                                invalidCount++;
                            }
                        }
                    });
                });

                if (extractedEmails.size === 0) {
                    onError("No valid email formats found in the specified columns.");
                } else if (invalidCount > 0) {
                    onError(`Imported ${extractedEmails.size} emails, but skipped ${invalidCount} invalid formats.`, 'warning');
                    onEmailsParsed(Array.from(extractedEmails));
                } else {
                    onEmailsParsed(Array.from(extractedEmails));
                }
            }
        });
    };

    return (
        <div className="csv-upload-zone">
            <div className="upload-instructions">
                <p>Upload a CSV file containing at least one <strong>'Email'</strong> column.</p>
            </div>
            <label className="file-input-label">
                {fileName || "Click to choose CSV file"}
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload} 
                    hidden 
                />
            </label>
        </div>
    );
};