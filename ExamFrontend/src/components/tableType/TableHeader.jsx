export const TableHeader = ({ headerArray }) => {
    return (
        <thead>
            <tr>
                {headerArray.map((header, index) => (
                    <th key={index} className="px-4 py-2 text-left">
                        {header}
                    </th>
                ))}
            </tr>
        </thead>
    )
}