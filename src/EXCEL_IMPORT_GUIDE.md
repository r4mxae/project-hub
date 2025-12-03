# Excel Import Guide - Date Handling

This guide explains how the application handles Excel date formats during import.

## How Excel Stores Dates

Excel stores dates as serial numbers (the number of days since January 1, 1900). For example:
- `1` = January 1, 1900
- `44927` = December 31, 2022
- `45292` = December 31, 2023

When you see a date formatted as "12/31/2023" in Excel, it's actually stored as the number `45292` with display formatting applied.

## How the Application Handles Excel Dates

The application now automatically converts Excel dates to the required `DD-MM-YYYY` format during import.

### Supported Date Formats

The application can read and convert the following Excel date formats:

1. **Excel Serial Numbers** (Excel's native format)
   - Example: `45292` → `31-12-2023`

2. **Excel Date Cells** (formatted as dates in Excel)
   - Example: `12/31/2023` → `31-12-2023`
   - Example: `31-Dec-2023` → `31-12-2023`

3. **Text Dates with Slashes**
   - Example: `12/31/2023` → `31-12-2023`
   - Example: `31/12/2023` → `31-12-2023`

4. **Text Dates with Dashes**
   - Example: `2023-12-31` → `31-12-2023`
   - Example: `31-12-2023` → `31-12-2023` (already correct format)

5. **ISO Date Strings**
   - Example: `2023-12-31T00:00:00` → `31-12-2023`

## How to Format Dates in Your Excel File

### Option 1: Use Excel Date Format (Recommended)

1. Select the date column in Excel
2. Right-click → Format Cells
3. Choose **Date** category
4. Select any date format (the app will convert it automatically)
5. Click OK

### Option 2: Enter Dates as Text

You can also enter dates directly as text in any of these formats:
- `31/12/2023`
- `12/31/2023`
- `2023-12-31`
- `31-12-2023`

The application will automatically convert them to `DD-MM-YYYY` format.

## Import Process

### Step-by-Step:

1. **Prepare Your Excel File**
   - Ensure your date column is formatted (see above)
   - All required columns are present

2. **Upload the File**
   - Go to Procurement → Import Excel
   - Click "Upload Excel File"
   - Select your `.xlsx` or `.xls` file

3. **Map Columns**
   - Map "Recommended PR Date" to your date column
   - Map all other required fields

4. **Import**
   - Click "Import"
   - The app automatically converts all dates to `DD-MM-YYYY` format
   - Success message appears when done

## Technical Details

### The Conversion Function

The application uses a `convertExcelDate()` function that:

1. **Checks if the value is already in DD-MM-YYYY format**
   - If yes, uses it as-is
   - If no, proceeds to conversion

2. **Handles Excel serial numbers**
   - Converts using the Excel epoch (January 1, 1900)
   - Accounts for Excel's leap year bug
   - Formula: `Date = 1900-01-01 + (serial - 2) days`

3. **Handles Date objects**
   - Extracts day, month, year
   - Formats as DD-MM-YYYY

4. **Handles text dates**
   - Parses common date formats
   - Converts to DD-MM-YYYY

5. **Returns empty string for invalid dates**
   - Prevents errors from corrupted data

### Code Implementation

```typescript
// In Procurement.tsx

// Excel read with date support
const workbook = XLSX.read(data, { 
  type: 'binary', 
  cellDates: true  // Convert Excel dates to Date objects
});

// Sheet to JSON with date formatting
const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  raw: false,           // Don't keep raw values
  dateNF: 'dd-mm-yyyy'  // Date number format
});

// During import
recommendedPRDate: convertExcelDate(row[columnMapping.recommendedPRDate])
```

## Examples

### Example 1: Excel Date Cell

**Excel Cell (formatted as date):** `12/31/2023`  
**Excel Internal Value:** `45292`  
**After Import:** `31-12-2023` ✅

### Example 2: Text Date with Slashes

**Excel Cell (as text):** `31/12/2023`  
**After Import:** `31-12-2023` ✅

### Example 3: ISO Date String

**Excel Cell (as text):** `2023-12-31`  
**After Import:** `31-12-2023` ✅

### Example 4: Already Correct Format

**Excel Cell (as text):** `31-12-2023`  
**After Import:** `31-12-2023` ✅ (unchanged)

## Troubleshooting

### Issue: Dates appear as numbers after import

**Cause:** Excel is storing dates as serial numbers but they're not being recognized.

**Solution:**
1. In Excel, select the date column
2. Format as Date (not General or Number)
3. Re-save the file
4. Import again

### Issue: Dates are in wrong format (e.g., MM-DD-YYYY)

**Cause:** Excel is using US date format.

**Solution:**
The app automatically handles this! Just ensure the dates are valid dates in Excel.

### Issue: Some dates import correctly, others don't

**Cause:** Mixed formats in the same column.

**Solution:**
1. In Excel, select the entire date column
2. Format all cells as Date
3. Check for any cells with text that looks like dates but isn't
4. Re-save and import

### Issue: Dates show as "#####" in Excel

**Cause:** Column is too narrow to display the date.

**Solution:**
1. Double-click the column border to auto-fit
2. This is just a display issue - the import will still work

## Best Practices

### For Single-Time Imports:
1. ✅ Format date column as Date in Excel
2. ✅ Verify a few dates look correct before importing
3. ✅ Save the file before importing
4. ✅ Import and verify in the app

### For Regular Imports:
1. ✅ Create an Excel template with date column pre-formatted
2. ✅ Always paste new data into the template
3. ✅ Use consistent date format in your source data
4. ✅ Keep a backup of your Excel file

### For Team Use:
1. ✅ Share the Excel template with your team
2. ✅ Document which date format to use
3. ✅ Use Excel's data validation to enforce date formats
4. ✅ Test with a small file first

## Excel Date Validation (Optional)

To prevent date format issues, you can add data validation in Excel:

1. Select the date column
2. Go to Data → Data Validation
3. Choose "Date" under Allow
4. Set Start date and End date limits
5. Click OK

This ensures only valid dates can be entered in that column.

## Common Excel Date Formats

| Excel Display | Excel Internal | After Import |
|---------------|----------------|--------------|
| 31/12/2023 | 45292 | 31-12-2023 |
| 12/31/2023 | 45292 | 31-12-2023 |
| 31-Dec-23 | 45292 | 31-12-2023 |
| December 31, 2023 | 45292 | 31-12-2023 |
| 2023-12-31 | 45292 | 31-12-2023 |

All of these will be correctly converted to `31-12-2023` format!

## Testing Your Import

Before importing your full dataset:

1. **Create a test file** with 3-5 rows
2. **Include different date formats** in the test
3. **Import the test file**
4. **Verify the dates** appear correctly in the app
5. **If correct**, proceed with full import
6. **If incorrect**, check the troubleshooting section

## Additional Notes

- The app uses `DD-MM-YYYY` format internally
- All date displays in the app use this format
- Sorting and filtering work correctly with this format
- The Upcoming tab uses these dates to calculate next month's PRs
- The Analysis tab uses these dates for trend analysis

## Support

If you encounter issues with date imports:

1. Check the browser console (F12) for errors
2. Verify your Excel file has valid dates
3. Try a different date format in Excel
4. Create a minimal test file to isolate the issue
5. Ensure you're using `.xlsx` or `.xls` file format

---

**Updated:** December 2024  
**Applies to:** Project Hub v1.0 and above
