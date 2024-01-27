<div className="flex mt-10">
  {/* Existing Table (入庫記錄) */}
  <div className="flex-grow">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">入庫記錄</h2>
    {/* Replace with your existing table code here */}
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
      <table className="min-w-full divide-y divide-gray-300">
        {/* Table header and body for 入庫記錄 */}
        {/* Map your existing data for this table here */}
      </table>
    </div>
  </div>

  {/* New Table (出庫記錄) */}
  <div className="flex-grow-0 w-1/5 ml-4">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">出庫記錄</h2>
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
      <table className="min-w-full divide-y divide-gray-300">
        {/* Table header and body for 出庫記錄 */}
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
              出庫日期
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-gray-900">
              公斤
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {/* Map your data for the new table here */}
          {/* Example: */}
          {/* searchResults.chemicalIndividualOutput.map((output, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {output.output_date}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {output.kg}
              </td>
            </tr>
          )) */}
        </tbody>
      </table>
    </div>
  </div>
</div>
