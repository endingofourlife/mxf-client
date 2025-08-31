import type {IncomePlanData} from "../interfaces/IncomePlanData.ts";

interface PreviewIncomeDataProps {
    data: IncomePlanData[];
}

function PreviewIncomeData({ data }: PreviewIncomeDataProps) {
    if (!data || data.length === 0) {
        return <p>No data to display</p>;
    }

    // Get headers from the first row (excluding custom_fields if empty)
    const headers = Object.keys(data[0]).filter(
        (key) => key !== 'custom_fields' || (data[0].custom_fields && Object.keys(data[0].custom_fields).length > 0)
    );

    return (
        <section>
            <h3>Parsed Income Data</h3>
            <table>
                <thead>
                <tr>
                    {headers.map((header) => (
                        <th key={header}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {headers.map((header) => (
                            <td key={header}>
                                {header === 'custom_fields'
                                    ? row.custom_fields
                                        ? JSON.stringify(row.custom_fields)
                                        : ''
                                    : row[header] != null
                                        ? String(row[header])
                                        : ''}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    );
}

export default PreviewIncomeData;