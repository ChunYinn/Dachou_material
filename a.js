const glpk = require('glpk.js');

function solveLP() {
    let lp = {
        name: "Ingredient Mix Problem",
        objective: {
            direction: glpk.GLP_MIN,
            name: "obj",
            vars: []
        },
        subjectTo: [],
        bounds: []
    };

    // Example data
    const ingredients = ['a', 'p', 'l', 'e']; 
    const batches = {
        'a': [{id: 1, hardness: 50, stock: 1.5}, {id: 2, hardness: 48, stock: 1}],
        'p': [{id: 1, hardness: 52, stock: 1}],
        'l': [{id: 1, hardness: 49, stock: 1}],
        'e': [{id: 1, hardness: 51, stock: 1}]
    };
    const recipe = {'a': 1, 'p': 1, 'l': 1, 'e': 1};
    const desiredHardness = 50;
    const totalWeight = 5;

    // Defining variables and setting up the objective function
    ingredients.forEach(ingredient => {
        batches[ingredient].forEach(batch => {
            let varName = `x_${ingredient}_${batch.id}`;
            lp.objective.vars.push({name: varName, coef: batch.hardness});
            lp.bounds.push({name: varName, type: glpk.GLP_DB, lb: 0, ub: batch.stock});
        });
    });

    // Ingredient Quantity Constraints
    ingredients.forEach(ingredient => {
        let constraint = {
            name: `Recipe_${ingredient}`,
            vars: [],
            bnds: {type: glpk.GLP_FX, lb: recipe[ingredient], ub: recipe[ingredient]}
        };
        batches[ingredient].forEach(batch => {
            constraint.vars.push({name: `x_${ingredient}_${batch.id}`, coef: 1});
        });
        lp.subjectTo.push(constraint);
    });

    // Total Weight Constraint
    let totalWeightConstraint = {
        name: "Total_Weight",
        vars: [],
        bnds: {type: glpk.GLP_FX, lb: totalWeight, ub: totalWeight}
    };
    ingredients.forEach(ingredient => {
        batches[ingredient].forEach(batch => {
            totalWeightConstraint.vars.push({name: `x_${ingredient}_${batch.id}`, coef: 1});
        });
    });
    lp.subjectTo.push(totalWeightConstraint);

    // Solve the LP
    let smcp = new glpk.SMCP({presolve: glpk.GLP_ON});
    let solution = glpk.solve(lp, smcp);

    console.log("Solution Status:", solution.status);
    console.log("Objective Value (Minimized Hardness Difference):", solution.result.obj);
    solution.result.vars.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });
}

solveLP();
