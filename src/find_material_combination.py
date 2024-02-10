from itertools import product
import json
import sys

def find_best_material_combination(materials, formula_requirements, target_hardness):
    # Check material availability against the requirements
    def check_material_availability():
        for material, requirements in formula_requirements.items():
            total_available = sum(option[1] for option in materials[material])
            if total_available < requirements:
                return False, "All material added up not enough."
        return True, "Sufficient material available."

    # Filter options that individually meet or exceed the requirement
    def filter_valid_options():
        valid_options = {}
        for material, requirement in formula_requirements.items():
            valid_options[material] = [option for option in materials[material] if option[1] >= requirement]
        return valid_options

    # Calculate total hardness
    def calculate_total_hardness(material_options):
        total_hardness_weighted = sum(hardness * formula_requirements[mat] for mat, (_, kg, hardness) in zip(materials.keys(), material_options))
        total_kg = sum(formula_requirements.values())
        return total_hardness_weighted / total_kg

    availability_check, message = check_material_availability()
    if not availability_check:
        return json.dumps({"error": message})

    valid_material_options = filter_valid_options()

    if not all(valid_material_options.values()):
        return json.dumps({"error": "原料足夠,但單一選項無法滿足目標重量."})
        ##change here !!!!!

    all_combinations = list(product(*[options for options in valid_material_options.values()]))

    best_diff = float('inf')
    best_combination = None
    for combination in all_combinations:
        total_hardness = calculate_total_hardness(combination)
        diff = abs(total_hardness - target_hardness)
        if diff < best_diff:
            best_diff = diff
            best_combination = combination

    if best_combination:
        best_combination_details = [[mat, option[0], option[2], formula_requirements[mat]] for mat, option in zip(materials.keys(), best_combination)]
        return json.dumps({"best_combination_details": best_combination_details, "minimum_hardness_difference": best_diff})
    else:
        return json.dumps({"error": "Not possible: No single option combination can meet the target hardness within the available materials."})


if __name__ == '__main__':
    # Read input from stdin
    input_json = sys.stdin.read()
    input_data = json.loads(input_json)

    materials = input_data['materials']
    formula_requirements = input_data['formula_requirements']
    target_hardness = input_data['target_hardness']

    result = find_best_material_combination(materials, formula_requirements, target_hardness)
    print(json.dumps(result))

# Example usage
# materials = {
#     'A': [('id:1', 10, 5), ('id:2', 5, 10), ('id:3', 7, 8)],
#     'B': [('id:4', 15, 10), ('id:5', 5, 12), ('id:6', 8, 11), ('id:7', 9, 9)],
#     'C': [('id:8', 10, 15), ('id:9', 10, 18), ('id:10', 12, 14)],
# }

# formula_requirements = {
#     'A': 22,
#     'B': 10,
#     'C': 10,
# }

# target_hardness = 13

# # Call the function with the provided parameters
# result = find_best_material_combination(materials, formula_requirements, target_hardness)
# print(result)


