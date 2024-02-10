function cartesianProduct(arr) {
    return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
}

function findBestMaterialCombination(materials, formulaRequirements, targetHardness) {
    const validMaterialOptions = Object.keys(materials).map(material => 
        materials[material].map(option => ({ material, ...option }))
    );

    const allCombinations = cartesianProduct(validMaterialOptions);

    let bestDiff = Infinity;
    let bestCombination = null;
    let finalAvgHardness = 0;

    allCombinations.forEach(combination => {
        const materialTotals = combination.reduce((acc, curr) => {
            acc[curr.material] = (acc[curr.material] || 0) + curr.kg;
            return acc;
        }, {});

        const meetsRequirements = Object.keys(formulaRequirements).every(material => 
            materialTotals[material] && materialTotals[material] >= formulaRequirements[material]
        );

        if (meetsRequirements) {
            const totalHardness = combination.reduce((total, curr) => 
                total + (curr.hardness * formulaRequirements[curr.material]), 0
            );
            const totalKg = Object.values(formulaRequirements).reduce((total, reqKg) => total + reqKg, 0);
            const avgHardness = totalHardness / totalKg;

            const diff = Math.abs(avgHardness - targetHardness);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestCombination = combination;
                finalAvgHardness = avgHardness;
            }
        }
    });

    if (bestCombination) {
        const bestCombinationDetails = bestCombination.map(({ material, batchNumber, hardness }) => ({
            batchNumber,
            kg: formulaRequirements[material], // Use the kg requirement from formulaRequirements
            hardness
        }));

        return JSON.stringify({
            bestCombinationDetails, 
            minimumHardnessDifference: parseFloat(bestDiff.toFixed(2)), 
            finalAvgHardness: parseFloat(finalAvgHardness.toFixed(2)) 
        });
    } else {
        return JSON.stringify({ error: "無法使用單一原料完成, 請自行選取原料" });
    }
}

module.exports = { findBestMaterialCombination, cartesianProduct };
// Example usage
// const materials = {
//     'A': [
//         {batchNumber: 'DH1024020801', kg: 90, hardness: 20},
//         {batchNumber: 'DH1024020802', kg: 50, hardness: 30}
//     ],
//     'B': [
//         {batchNumber: 'BH1024020801', kg: 70, hardness: 15},
//         {batchNumber: 'BH1024020802', kg: 40, hardness: 25}
//     ],
//     'C': [
//         {batchNumber: 'CH1024020801', kg: 60, hardness: 18},
//         {batchNumber: 'CH1024020802', kg: 55, hardness: 22}
//     ]
// };

// const formulaRequirements = {
//     'A': 90,
//     'B': 10,
//     'C': 15
// };

// const targetHardness = 13;

// // Call the function with the provided parameters
// const result = findBestMaterialCombination(materials, formulaRequirements, targetHardness);
// console.log(result);
