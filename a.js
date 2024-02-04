const { exec } = require('child_process');

exec('python a.py', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    try {
        const result = JSON.parse(stdout);
        if (result.best_combination_details) {
            console.log("Best combination details (Material, ID, Hardness, Quantity):", result.best_combination_details);
            console.log("Minimum hardness difference:", result.minimum_hardness_difference);
        } else if (result.error) {
            console.log(result.error);
        }
    } catch (parseError) {
        console.error('Error parsing JSON from Python script:', parseError);
    }
});
