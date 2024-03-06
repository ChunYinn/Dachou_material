//一樣硬度會先選擇A開頭的批號，再選擇其他批號

function cartesianProduct(arr) {
    return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
}

function findBestMaterialCombination(materials, formulaRequirements, targetHardness, batchNumber) {
    // Process materials to separate those with position starting with 'A' from others
    const validMaterialOptionsA = Object.keys(materials).map(material => 
        materials[material].filter(option => option.position.startsWith('A')).map(option => ({ material, ...option }))
    );
    const validMaterialOptionsOthers = Object.keys(materials).map(material => 
        materials[material].filter(option => !option.position.startsWith('A')).map(option => ({ material, ...option }))
    );

    // Combine 'A' position options with other options for full coverage, ensuring 'A' position options are first
    const combinedMaterialOptions = validMaterialOptionsA.map((options, index) => 
        [...options, ...validMaterialOptionsOthers[index]]
    );

    // Generate all possible combinations of material options, prioritizing 'A' positions
    const allCombinations = cartesianProduct(combinedMaterialOptions);
    console.log('allCombinations:', allCombinations);

    let bestDiff = Infinity;
    let bestCombination = null;
    let finalAvgHardness = 0;

    // Evaluate each combination
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
    });

    // Return the best combination found, if any
    if (bestCombination) {
        const bestCombinationDetails = bestCombination.map(({ material, batchNumber, hardness, position, supplierBatch }) => ({
            material,
            batchNumber,
            supplierBatch, // Include the supplierBatch identifier
            kg: formulaRequirements[material], // Use the kg requirement from formulaRequirements
            hardness,
            position, // Include the position identifier
        }));

        return {
            bestCombinationDetails,
            minimumHardnessDifference: parseFloat(bestDiff.toFixed(2)),
            finalAvgHardness: parseFloat(finalAvgHardness.toFixed(2)),
            materialBatchNumber: batchNumber
        };
    } else {
        return { error: "Unable to complete using a single material, please select materials manually." };
    }
}

module.exports = { findBestMaterialCombination, cartesianProduct };



// How the Code Works:
// Separating Material Options: The function will split each material's options into those where supplierBatch starts with 'A' and those that do not.

// For example:

// DD04 will have one list with {batchNumber: 'DD0424021902', supplierBatch: 'AAAA',...} (since it starts with 'A') and another with {batchNumber: 'DD0424021901', supplierBatch: 'SDFDS',...}.
// DD11-Acc, DD50, and DD52 will have similar splits based on the supplierBatch.
// Combining Material Options: The function combines the 'A' lists and the non-'A' lists while maintaining the priority for 'A' options. In our example, for DD04, DD11-Acc, DD50, and DD52, it places the options with supplierBatch starting with 'A' first.

// Generating All Possible Combinations: It generates all possible combinations, but since 'A' options are first, combinations with more 'A' batches are generated earlier. This doesn't mean all materials in a combination will have 'A' batches; rather, combinations are explored with a preference for 'A' batches where possible.

// Evaluating Combinations: The function evaluates each combination against the formula requirements and target hardness. For example, it will first check a combination like:

// DD04: Option with supplierBatch 'AAAA'
// DD11-Acc: Option with supplierBatch 'AAAA'
// DD50: Option with supplierBatch 'A11111'
// DD52: Option with supplierBatch 'A123'
// It calculates the total and average hardness of this combination, checks if it meets the material kg requirements, and compares the average hardness to the target hardness.

// Selecting the Best Combination: If a combination meets the formula requirements and is closest to the target hardness, it is marked as the best combination. The search continues, but now there's a benchmark (the best combination found so far).

// Result: If a best combination is found, it is returned with details including supplierBatch. If no combination meeting the requirements is found, the error message is returned.
