# Todo Filter Utility

## Purpose
Create a utility module that filters and sorts todo items by status, priority, and due date to support the todo list view in the frontend.

## Requirements
- Filter todos by status (completed, pending, overdue)
- Sort todos by priority (high, medium, low) and due date
- Support combining multiple filters
- Return empty array when no todos match the criteria

## Approach
Implement a TodoFilter class with chainable methods for filtering and sorting. Each method returns a new filtered array without mutating the original. Use TypeScript generics to keep the interface type-safe. Place the module in src/utils/ alongside existing utilities.

## Verification
- Filtering by status returns only matching todos
- Sorting by priority orders high > medium > low
- Combining status filter and priority sort works correctly
- Empty input array returns empty array
- Overdue detection correctly compares against current date
