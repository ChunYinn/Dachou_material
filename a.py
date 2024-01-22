from itertools import product

# Example data
ingredients = {'a': 'letter_a', 'p': 'letter_p', 'l': 'letter_l', 'e': 'letter_e'}  # Ingredient names and their batch IDs
suppliers = {  # Suppliers with (id, batch_id, hardness, stock_kg)
    'a1': ('letter_a', 50, 1.5),
    'a2': ('letter_a', 48, 1),
    'p1': ('letter_p', 52, 1),
    'l1': ('letter_l', 49, 1),
    'e1': ('letter_e', 51, 1)
}
recipe = {'letter_a': 1, 'letter_p': 1, 'letter_l': 1, 'letter_e': 1}  # Required quantities for each batch
desired_hardness = 50
total_weight = 4

# Function to calculate hardness difference
def hardness_difference(combination):
    total_hardness = sum(suppliers[id][1] * amount for id, amount in combination)
    return abs(desired_hardness * total_weight - total_hardness)

# Generate all possible combinations from suppliers, considering the available stock
all_combinations = []
for ingredient, batch_id in ingredients.items():
    ingredient_combinations = []
    for id, details in suppliers.items():
        if details[0] == batch_id:
            for amount in [x * 0.1 for x in range(1, int(details[2]/0.1) + 1)]:
                ingredient_combinations.append((id, amount))
    all_combinations.append(ingredient_combinations)

# Cartesian product of all combinations
all_product_combinations = list(product(*all_combinations))

# Filter combinations that match the total weight
valid_combinations = [comb for comb in all_product_combinations if round(sum(amount for _, amount in comb), 1) == total_weight]

# Find the combination with the minimum hardness difference
min_diff = float('inf')
best_combination = None
for comb in valid_combinations:
    diff = hardness_difference(comb)
    if diff < min_diff:
        min_diff = diff
        best_combination = comb

# Output the results
if best_combination:
    print("Best combination:")
    for id, amount in best_combination:
        print(f"Supplier ID {id}, Amount {amount}")
    print(f"Total Hardness Difference: {min_diff}")
else:
    print("No valid combination found")
