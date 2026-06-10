# Inventory Calculator

## Purpose
Create an inventory calculation module that computes stock value, identifies low-stock items, and generates reorder suggestions for the inventory management system.

## Requirements
- Calculate total inventory value (sum of price * stock for all products)
- Identify low-stock items below a configurable threshold (default: 10)
- Generate reorder suggestions with recommended quantities based on category averages
- Support filtering calculations by product category

## Approach
Implement an InventoryCalculator class that takes an array of Product items. Methods should be stateless and return new data structures. Use the existing Product interface from src/models/product.ts. Place the module in src/services/.

## Verification
- Total value calculation returns correct sum of price * stock
- Low-stock detection correctly identifies items below threshold
- Custom threshold overrides default value of 10
- Reorder suggestions include product id and recommended quantity
- Category filter limits calculations to matching products only
