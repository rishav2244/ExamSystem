export const DataTable = ({ data }) => {
  const [headers, ...rows] = data;

  const reqHeaders = headers.slice(0, 6);

  return (
    <table>
      <thead>
        <tr>
          {reqHeaders.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.slice(0, 6).map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};