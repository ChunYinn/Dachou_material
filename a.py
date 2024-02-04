from itertools import product
import json

# Updated list of available materials with their options (ID, kg available, hardness)
materials = {
    'A': [('id:1', 10, 5), ('id:2', 5, 10), ('id:3', 7, 8)],  # Added IDs
    'B': [('id:4', 15, 10), ('id:5', 5, 12), ('id:6', 8, 11), ('id:7', 9, 9)],  # Added IDs
    'C': [('id:8', 10, 15), ('id:9', 10, 18), ('id:10', 12, 14)],  # Added IDs
}

# Formula requirements remain the same
formula_requirements = {
    'A': 10,
    'B': 10,
    'C': 10,
}

# Target hardness remains the same
target_hardness = 13

# Check material availability against the requirements
def check_material_availability(materials, formula_requirements):
    for material, requirements in formula_requirements.items():
        total_available = sum(option[1] for option in materials[material])
        if total_available < requirements:
            return False, "All material added up not enough."
    return True, "Sufficient material available."

# Function to filter options that individually meet or exceed the requirement
def filter_valid_options(materials, formula_requirements):
    valid_options = {}
    for material, requirement in formula_requirements.items():
        valid_options[material] = [option for option in materials[material] if option[1] >= requirement]
    return valid_options

# Function to calculate total hardness
def calculate_total_hardness(material_options):
    total_hardness_weighted = sum(hardness * formula_requirements[mat] for mat, (_, kg, hardness) in zip(materials.keys(), material_options))
    total_kg = sum(formula_requirements.values())
    return total_hardness_weighted / total_kg

# Main execution starts here
availability_check, message = check_material_availability(materials, formula_requirements)
if not availability_check:
    print(message)
else:
    valid_material_options = filter_valid_options(materials, formula_requirements)

    # Check if there are valid options for all materials
    if not all(valid_material_options.values()):  # This checks if any category has no valid options
        print("原料足夠,但單一選項無法滿足目標重量.")
    else:
        # Generate all possible combinations of valid material options
        all_combinations = list(product(*[options for options in valid_material_options.values()]))

        best_diff = float('inf')
        best_combination = None
        for combination in all_combinations:
            total_hardness = calculate_total_hardness(combination)
            diff = abs(total_hardness - target_hardness)
            if diff < best_diff:
                best_diff = diff
                best_combination = combination

        # if best_combination:
        #     best_combination_details = [(mat, option[0], option[2], formula_requirements[mat]) for mat, option in zip(materials.keys(), best_combination)]
        #     print("Best combination details (Material, ID, Hardness, Quantity):", best_combination_details)
        #     print("Minimum hardness difference:", best_diff)
        # else:
        #     print("Not possible: No single option combination can meet the target hardness within the available materials.")
        # At the end of your Python script, replace the print statements with this:
        if best_combination:
            best_combination_details = [[mat, option[0], option[2], formula_requirements[mat]] for mat, option in zip(materials.keys(), best_combination)]
            print(json.dumps({"best_combination_details": best_combination_details, "minimum_hardness_difference": best_diff}))
        else:
            print(json.dumps({"error": "Not possible: No single option combination can meet the target hardness within the available materials."}))

