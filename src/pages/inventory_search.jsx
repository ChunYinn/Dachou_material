const inventory = [
    { date: '2024/01/01', id: 'DA0124010', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    { date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    {date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    {date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
    {date: '2024/01/01', id: 'DA012401171', kg: '10', pos: 'A',company:'長弘',hardness:'70',ppl:'峻印', pass:'NO',company_id:'IISu32839534' },
  ]
  
  const labels = ["化工原料ID","化工原料名稱","目前庫存","功能","單價","庫存價值"];
  const data = ["HB-F0-01-02-D", " TPE", " 60", " 黑", "123", " 通用"];
  
  
  export default function InventorySearch() {

    return (
      <div className="flex justify-center items-center mt-14">
  
        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-4xl mb-4 font-semibold leading-6 text-gray-900">化工原料庫存管理</h1>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-4">
          
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                  >
                    化工原料ID
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="DH10"
                  />
                </div>
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                  >
                    化工名稱
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="AN-300"
                  />
                </div>
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-semibold text-indigo-700"
                  >
                    批號
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="AN123123"
                  />
                </div>
              </div>
            </div>
  
            <div className="flex flex-col mt-10">            
              {/* Top table showing material basic info ------------------- */}
              <div className="mt-5 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap p-5 bg-white rounded-lg shadow-lg ring-1 ring-gray-300">
                  {labels.map((label, index) => (
                    <div className="flex items-center mb-4 md:mb-0 md:w-1/3" key={label}>
                      <div className="mr-4">
                        <label className="text-sm font-bold leading-6 text-gray-900">
                          {label}:
                        </label>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-700">
                          {data[index]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* formula table ----------------------------------------------*/}
              <div className=" mt-10 px-4 sm:px-6 lg:px-8">  
                <div className="flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                入庫日期
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                批號
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                公斤
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                位子
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                廠商
                              </th> 
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                硬度
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                檢測人員
                              </th> 
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                合格
                              </th> 
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                廠商批號
                              </th> 
                              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {inventory.map((inventry, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {inventry.date}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.id}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.kg}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.pos}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.company}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.hardness}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.ppl}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.pass}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inventry.company_id}</td>

                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                    出庫紀錄<span className="sr-only">, {index}</span>
                                    </a>
                                </td>
                              </tr>
                            ))}
                            {/* <tr>
                              <td colSpan={1} className="text-sm font-bold text-gray-900 text-right px-3 py-4">合計</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">用量: {totalUsage.toFixed(2)}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">金額: {`$${totalPrice.toFixed(2)}`}</td>
                            </tr>  */}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* {here----------------------------------------------}   */}
            </div>
            
  
  
          </div>
      </div>
      
    )
  }