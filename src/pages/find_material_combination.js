function cartesianProduct(arr) {
    return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
}

function findBestMaterialCombination(materials, formulaRequirements, targetHardness, batchNumber) {
    // Process materials to include the 'material' key
    const validMaterialOptions = Object.keys(materials).map(material => 
        materials[material].map(option => ({ material, ...option }))
    );

    // Generate all possible combinations of material options
    const allCombinations = cartesianProduct(validMaterialOptions);

    // Separate combinations where all supplierBatches start with 'A'
    const supplierBatchACombinations = allCombinations.filter(combination =>
        combination.every(option => option.supplierBatch.startsWith('A'))
    );

    let bestDiff = Infinity;
    let bestCombination = null;
    let finalAvgHardness = 0;

    // Function to evaluate each combination (refactored for reuse)
    const evaluateCombination = (combination) => {
        const materialTotals = combination.reduce((acc, curr) => {
            acc[curr.material] = (acc[curr.material] || 0) + curr.kg;
            return acc;
        }, {});

        const meetsRequirements = Object.keys(formulaRequirements).every(material => 
            materialTotals[material] && materialTotals[material] >= formulaRequirements[material]
        );

        if (meetsRequirements) {
            const totalHardness = combination.reduce((total, curr) => 
                total + (curr.hardness * curr.kg), 0);
            const totalKg = Object.values(materialTotals).reduce((total, kg) => total + kg, 0);
            const avgHardness = totalHardness / totalKg;

            const diff = Math.abs(avgHardness - targetHardness);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestCombination = combination;
                finalAvgHardness = avgHardness;
            }
        }
    };

    // First, evaluate combinations where all supplierBatches start with 'A'
    supplierBatchACombinations.forEach(evaluateCombination);

    // If no suitable combination has been found yet, evaluate all combinations
    if (!bestCombination) {
        allCombinations.forEach(evaluateCombination);
    }

    // Output and return the best combination found, if any
    if (bestCombination) {
        const bestCombinationDetails = bestCombination.map(({ material, batchNumber, hardness, position, supplierBatch }) => ({
            material, // Include the raw material ID
            batchNumber,
            supplierBatch, // Include the supplierBatch identifier
            kg: formulaRequirements[material], // Use the kg requirement from formulaRequirements
            hardness,
            position,
        }));

        return {
            bestCombinationDetails,
            minimumHardnessDifference: parseFloat(bestDiff.toFixed(2)),
            finalAvgHardness: parseFloat(finalAvgHardness.toFixed(2)),
            materialBatchNumber: batchNumber
        };
    } else {
        return { error: "無法使用單一原料完成, 請自行選取原料" };
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
